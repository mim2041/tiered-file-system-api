import { prisma } from "@/config/prisma.config";

export const fileRepository = {
  listByOwnerAndFolder(ownerId: string, folderId: string | null) {
    return prisma.file.findMany({
      where: { ownerId, folderId, isDeleted: false },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(ownerId: string, id: string) {
    return prisma.file.findFirst({
      where: { id, ownerId, isDeleted: false },
    });
  },

  async createWithVersion(data: {
    ownerId: string;
    folderId: string | null;
    filename: string;
    originalName: string;
    sizeBytes: bigint;
    mimeType: string;
    storageKey: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const created = await tx.file.create({
        data: {
          ownerId: data.ownerId,
          folderId: data.folderId,
          filename: data.filename,
          originalName: data.originalName,
          sizeBytes: data.sizeBytes,
          mimeType: data.mimeType,
          storageKey: data.storageKey,
        },
      });

      await tx.fileVersion.create({
        data: {
          fileId: created.id,
          storageKey: created.storageKey,
          sizeBytes: created.sizeBytes,
        },
      });

      return created;
    });
  },

  rename(ownerId: string, id: string, filename: string) {
    return prisma.file.updateMany({
      where: { id, ownerId, isDeleted: false },
      data: { filename },
    });
  },

  softDelete(ownerId: string, id: string) {
    return prisma.file.updateMany({
      where: { id, ownerId, isDeleted: false },
      data: { isDeleted: true },
    });
  },
};

