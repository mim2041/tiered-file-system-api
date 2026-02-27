import { prisma } from "@/config/prisma.config";
import { cloudinaryFileUploadService } from "@/manager/cloudinary";
import { HttpError } from "@/utils/http-error";
import { folderRepository } from "@/features/folders/repositories/folder.repository";
import { fileRepository } from "../repositories/file.repository";
import type { UploadFileInput, RenameFileInput } from "../schemas";
import type { FileDto } from "../types";

const FEATURE_NAME = "files";

export const fileService = {
  async listFilesForUser(userId: string, folderId: string | null): Promise<FileDto[]> {
    const files = await fileRepository.listByOwnerAndFolder(userId, folderId);
    return files as unknown as FileDto[];
  },

  async uploadFileForUser(
    userId: string,
    payload: UploadFileInput,
    file: Express.Multer.File | undefined,
  ): Promise<FileDto> {
    if (!file) {
      throw new HttpError(400, "FILE_REQUIRED", "No file uploaded");
    }

    if (payload.folderId) {
      const folder = await folderRepository.findById(userId, payload.folderId);
      if (!folder) {
        throw new HttpError(404, "FOLDER_NOT_FOUND", "Parent folder not found");
      }
    }

    const uploadResult = await cloudinaryFileUploadService.uploadFile(file, FEATURE_NAME);

    const created = await prisma.$transaction(async (tx) => {
      const activeSubscription = await tx.userSubscription.findFirst({
        where: { userId, isActive: true },
        include: {
          package: {
            include: {
              allowedFileTypes: true,
            },
          },
        },
      });

      if (!activeSubscription) {
        throw new HttpError(
          403,
          "SUBSCRIPTION_REQUIRED",
          "An active subscription is required to upload files",
        );
      }

      const pkg = activeSubscription.package;
      const maxBytes = pkg.maxFileSizeMb * 1024 * 1024;

      if (file.size > maxBytes) {
        throw new HttpError(
          413,
          "FILE_TOO_LARGE_FOR_PACKAGE",
          `Maximum file size for your package is ${pkg.maxFileSizeMb}MB`,
        );
      }

      const allowedMimeTypes = pkg.allowedFileTypes.map((t) => t.mimeType);
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new HttpError(
          415,
          "MIME_TYPE_NOT_ALLOWED",
          "This file type is not allowed for your subscription package",
        );
      }

      const existingQuota = await tx.userQuota.findUnique({
        where: { userId },
      });

      const currentFileCount = existingQuota?.fileCount ?? 0;
      if (currentFileCount + 1 > pkg.totalFileLimit) {
        throw new HttpError(
          403,
          "TOTAL_FILE_LIMIT_REACHED",
          "You have reached the total file limit for your subscription package",
        );
      }

      const folderId = payload.folderId ?? null;
      if (folderId) {
        const folderStats = await tx.folderStats.findUnique({
          where: { folderId },
        });

        const currentFolderFileCount = folderStats?.fileCount ?? 0;
        if (currentFolderFileCount + 1 > pkg.filesPerFolderLimit) {
          throw new HttpError(
            403,
            "FOLDER_FILE_LIMIT_REACHED",
            "You have reached the maximum number of files allowed in this folder",
          );
        }
      }

      const sizeBigInt = BigInt(file.size);

      if (!existingQuota) {
        await tx.userQuota.create({
          data: {
            userId,
            folderCount: 0,
            fileCount: 1,
            usedStorageBytes: sizeBigInt,
          },
        });
      } else {
        await tx.userQuota.update({
          where: { userId },
          data: {
            fileCount: { increment: 1 },
            usedStorageBytes: { increment: sizeBigInt },
          },
        });
      }

      if (folderId) {
        await tx.folderStats.upsert({
          where: { folderId },
          create: {
            folderId,
            fileCount: 1,
            sizeBytes: sizeBigInt,
          },
          update: {
            fileCount: { increment: 1 },
            sizeBytes: { increment: sizeBigInt },
          },
        });
      }

      const createdFile = await tx.file.create({
        data: {
          ownerId: userId,
          folderId,
          filename: file.originalname,
          originalName: file.originalname,
          sizeBytes: sizeBigInt,
          mimeType: file.mimetype,
          storageKey: uploadResult.public_id,
        },
      });

      await tx.fileVersion.create({
        data: {
          fileId: createdFile.id,
          storageKey: createdFile.storageKey,
          sizeBytes: createdFile.sizeBytes,
        },
      });

      return createdFile;
    });

    return created as unknown as FileDto;
  },

  async renameFileForUser(
    userId: string,
    id: string,
    payload: RenameFileInput,
  ): Promise<void> {
    const existing = await fileRepository.findById(userId, id);
    if (!existing) {
      throw new HttpError(404, "FILE_NOT_FOUND", "File not found");
    }

    await fileRepository.rename(userId, id, payload.filename);
  },

  async deleteFileForUser(userId: string, id: string): Promise<void> {
    const existing = await fileRepository.findById(userId, id);
    if (!existing) {
      throw new HttpError(404, "FILE_NOT_FOUND", "File not found");
    }

    await prisma.$transaction(async (tx) => {
      const result = await tx.file.updateMany({
        where: { id, ownerId: userId, isDeleted: false },
        data: { isDeleted: true },
      });

      if (result.count === 0) {
        throw new HttpError(404, "FILE_NOT_FOUND", "File not found");
      }

      const sizeBigInt = existing.sizeBytes as bigint;

      const quota = await tx.userQuota.findUnique({
        where: { userId },
      });

      if (quota) {
        const newFileCount = Math.max(0, quota.fileCount - 1);
        let newUsedStorage = (quota.usedStorageBytes as bigint) - sizeBigInt;
        if (newUsedStorage < 0n) {
          newUsedStorage = 0n;
        }

        await tx.userQuota.update({
          where: { userId },
          data: {
            fileCount: newFileCount,
            usedStorageBytes: newUsedStorage,
          },
        });
      }

      const folderId = existing.folderId as string | null;
      if (folderId) {
        const stats = await tx.folderStats.findUnique({
          where: { folderId },
        });

        if (stats) {
          const newFolderFileCount = Math.max(0, stats.fileCount - 1);
          let newFolderSize = (stats.sizeBytes as bigint) - sizeBigInt;
          if (newFolderSize < 0n) {
            newFolderSize = 0n;
          }

          await tx.folderStats.update({
            where: { folderId },
            data: {
              fileCount: newFolderFileCount,
              sizeBytes: newFolderSize,
            },
          });
        }
      }
    });
  },
};

