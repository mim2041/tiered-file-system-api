import { prisma } from "@/config/prisma.config";

export const packageRepository = {
  listWithTypes() {
    return prisma.subscriptionPackage.findMany({
      include: { allowedFileTypes: true },
      orderBy: { createdAt: "asc" },
    });
  },

  findById(id: string) {
    return prisma.subscriptionPackage.findUnique({
      where: { id },
      include: { allowedFileTypes: true },
    });
  },

  findByNameOrSlug(name: string, slug: string) {
    return prisma.subscriptionPackage.findFirst({
      where: { OR: [{ name }, { slug }] },
    });
  },

  create(data: {
    name: string;
    slug: string;
    description?: string | null;
    maxFolders: number;
    maxNestingLevel: number;
    maxFileSizeMb: number;
    totalFileLimit: number;
    filesPerFolderLimit: number;
    mimeTypes: string[];
  }) {
    return prisma.subscriptionPackage.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        maxFolders: data.maxFolders,
        maxNestingLevel: data.maxNestingLevel,
        maxFileSizeMb: data.maxFileSizeMb,
        totalFileLimit: data.totalFileLimit,
        filesPerFolderLimit: data.filesPerFolderLimit,
        allowedFileTypes: {
          createMany: { data: data.mimeTypes.map((mimeType) => ({ mimeType })) },
        },
      },
      include: { allowedFileTypes: true },
    });
  },

  async updateWithTypes(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      description: string | null;
      maxFolders: number;
      maxNestingLevel: number;
      maxFileSizeMb: number;
      totalFileLimit: number;
      filesPerFolderLimit: number;
      mimeTypes: string[];
    }>,
  ) {
    return prisma.$transaction(async (tx) => {
      if (data.mimeTypes) {
        await tx.packageFileType.deleteMany({ where: { packageId: id } });
      }

      return tx.subscriptionPackage.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          maxFolders: data.maxFolders,
          maxNestingLevel: data.maxNestingLevel,
          maxFileSizeMb: data.maxFileSizeMb,
          totalFileLimit: data.totalFileLimit,
          filesPerFolderLimit: data.filesPerFolderLimit,
          allowedFileTypes: data.mimeTypes
            ? { createMany: { data: data.mimeTypes.map((mimeType) => ({ mimeType })) } }
            : undefined,
        },
        include: { allowedFileTypes: true },
      });
    });
  },

  remove(id: string) {
    return prisma.subscriptionPackage.delete({ where: { id } });
  },
};

