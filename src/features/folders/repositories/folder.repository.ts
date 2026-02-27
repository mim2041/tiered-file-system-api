import { prisma } from "@/config/prisma.config";

export const folderRepository = {
  listByOwnerAndParent(ownerId: string, parentId: string | null) {
    return prisma.folder.findMany({
      where: { ownerId, parentId, isDeleted: false },
      orderBy: { createdAt: "asc" },
    });
  },

  findById(ownerId: string, id: string) {
    return prisma.folder.findFirst({
      where: { id, ownerId, isDeleted: false },
    });
  },

  create(data: { ownerId: string; parentId: string | null; name: string; path: string; depth: number }) {
    return prisma.folder.create({
      data,
    });
  },

  rename(ownerId: string, id: string, name: string) {
    return prisma.folder.updateMany({
      where: { id, ownerId, isDeleted: false },
      data: { name },
    });
  },

  softDelete(ownerId: string, id: string) {
    return prisma.folder.updateMany({
      where: { id, ownerId, isDeleted: false },
      data: { isDeleted: true },
    });
  },
};

