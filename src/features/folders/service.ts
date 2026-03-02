import { HttpError } from "@/utils/http-error";
import { prisma } from "@/config/prisma.config";
import { subscriptionRepository } from "@/features/subscriptions/repositories/subscription.repository";
import { folderRepository } from "./repositories/folder.repository";
import { CreateFolderInput, UpdateFolderInput } from "./schemas";
import { FolderDto } from "./types";

const buildPath = (parentPath: string | null, name: string) => {
  const sanitized = name.trim().replace(/\s+/g, "-");
  if (!parentPath) return `/${sanitized}`;
  return `${parentPath}/${sanitized}`;
};

const toDto = (folder: any): FolderDto => ({
  id: folder.id,
  ownerId: folder.ownerId,
  parentId: folder.parentId,
  name: folder.name,
  path: folder.path,
  depth: folder.depth,
  isDeleted: folder.isDeleted,
  createdAt: folder.createdAt,
  updatedAt: folder.updatedAt,
});

export const folderService = {
  async listForUser(userId: string, parentId?: string | null): Promise<FolderDto[]> {
    const activeSubscription = await subscriptionRepository.findActiveByUserId(userId);
    if (!activeSubscription) {
      throw new HttpError(
        403,
        "SUBSCRIPTION_REQUIRED",
        "An active subscription is required to manage folders",
      );
    }

    const resolvedParent = parentId ?? null;
    const items = await folderRepository.listByOwnerAndParent(userId, resolvedParent);
    return items.map(toDto);
  },

  async createForUser(userId: string, input: CreateFolderInput): Promise<FolderDto> {
    const activeSubscription = await subscriptionRepository.findActiveByUserId(userId);
    if (!activeSubscription) {
      throw new HttpError(
        403,
        "SUBSCRIPTION_REQUIRED",
        "An active subscription is required to create folders",
      );
    }

    const parentId = input.parentId ?? null;
    let parent: any = null;

    if (parentId) {
      parent = await folderRepository.findById(userId, parentId);
      if (!parent) {
        throw new HttpError(404, "PARENT_NOT_FOUND", "Parent folder not found");
      }
    }

    const depth = parent ? parent.depth + 1 : 1;
    if (depth > activeSubscription.package.maxNestingLevel) {
      throw new HttpError(
        403,
        "MAX_NESTING_LEVEL_EXCEEDED",
        `Maximum nesting level for your package is ${activeSubscription.package.maxNestingLevel}`,
      );
    }

    const currentFolderCount = await folderRepository.countActiveByOwner(userId);
    if (currentFolderCount + 1 > activeSubscription.package.maxFolders) {
      throw new HttpError(
        403,
        "MAX_FOLDERS_REACHED",
        "You have reached the maximum folder count for your subscription package",
      );
    }

    const path = buildPath(parent?.path ?? null, input.name);

    const created = await prisma.$transaction(async (tx) => {
      const newFolder = await tx.folder.create({
        data: {
          ownerId: userId,
          parentId,
          name: input.name,
          path,
          depth,
        },
      });

      const quota = await tx.userQuota.findUnique({ where: { userId } });
      if (!quota) {
        await tx.userQuota.create({
          data: {
            userId,
            folderCount: 1,
            fileCount: 0,
            usedStorageBytes: 0n,
          },
        });
      } else {
        await tx.userQuota.update({
          where: { userId },
          data: {
            folderCount: { increment: 1 },
          },
        });
      }

      await tx.folderStats.upsert({
        where: { folderId: newFolder.id },
        create: {
          folderId: newFolder.id,
          fileCount: 0,
          sizeBytes: 0n,
        },
        update: {},
      });

      return newFolder;
    });

    return toDto(created);
  },

  async renameForUser(userId: string, id: string, input: UpdateFolderInput): Promise<void> {
    const activeSubscription = await subscriptionRepository.findActiveByUserId(userId);
    if (!activeSubscription) {
      throw new HttpError(
        403,
        "SUBSCRIPTION_REQUIRED",
        "An active subscription is required to manage folders",
      );
    }

    const result = await folderRepository.rename(userId, id, input.name);
    if (result.count === 0) {
      throw new HttpError(404, "FOLDER_NOT_FOUND", "Folder not found");
    }
  },

  async deleteForUser(userId: string, id: string): Promise<void> {
    const activeSubscription = await subscriptionRepository.findActiveByUserId(userId);
    if (!activeSubscription) {
      throw new HttpError(
        403,
        "SUBSCRIPTION_REQUIRED",
        "An active subscription is required to manage folders",
      );
    }

    const existing = await folderRepository.findById(userId, id);
    if (!existing) {
      throw new HttpError(404, "FOLDER_NOT_FOUND", "Folder not found");
    }

    const childCount = await folderRepository.countChildren(userId, id);
    if (childCount > 0) {
      throw new HttpError(
        409,
        "FOLDER_HAS_CHILDREN",
        "Delete or move child folders before deleting this folder",
      );
    }

    await prisma.$transaction(async (tx) => {
      const result = await tx.folder.updateMany({
        where: { id, ownerId: userId, isDeleted: false },
        data: { isDeleted: true },
      });

      if (result.count === 0) {
        throw new HttpError(404, "FOLDER_NOT_FOUND", "Folder not found");
      }

      const quota = await tx.userQuota.findUnique({ where: { userId } });
      if (quota) {
        await tx.userQuota.update({
          where: { userId },
          data: {
            folderCount: Math.max(0, quota.folderCount - 1),
          },
        });
      }
    });
  },
};

