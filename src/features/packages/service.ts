import { prisma } from "@/config/prisma.config";
import { HttpError } from "@/utils/http-error";
import { CreatePackageInput, UpdatePackageInput } from "./schemas";
import { SubscriptionPackageDto } from "./types";

const toDto = (pkg: any): SubscriptionPackageDto => ({
  id: pkg.id,
  name: pkg.name,
  slug: pkg.slug,
  description: pkg.description,
  maxFolders: pkg.maxFolders,
  maxNestingLevel: pkg.maxNestingLevel,
  maxFileSizeMb: pkg.maxFileSizeMb,
  totalFileLimit: pkg.totalFileLimit,
  filesPerFolderLimit: pkg.filesPerFolderLimit,
  allowedFileTypes: pkg.allowedFileTypes.map((t: { mimeType: string }) => t.mimeType),
  createdAt: pkg.createdAt,
  updatedAt: pkg.updatedAt,
});

export const packageService = {
  async listPublic(): Promise<SubscriptionPackageDto[]> {
    const packages = await prisma.subscriptionPackage.findMany({
      include: { allowedFileTypes: true },
      orderBy: { createdAt: "asc" },
    });
    return packages.map(toDto);
  },

  async create(input: CreatePackageInput): Promise<SubscriptionPackageDto> {
    const exists = await prisma.subscriptionPackage.findFirst({
      where: {
        OR: [{ name: input.name }, { slug: input.slug }],
      },
    });
    if (exists) {
      throw new HttpError(409, "PACKAGE_CONFLICT", "Package name or slug already exists");
    }

    const created = await prisma.subscriptionPackage.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        maxFolders: input.maxFolders,
        maxNestingLevel: input.maxNestingLevel,
        maxFileSizeMb: input.maxFileSizeMb,
        totalFileLimit: input.totalFileLimit,
        filesPerFolderLimit: input.filesPerFolderLimit,
        allowedFileTypes: {
          createMany: {
            data: input.mimeTypes.map((mimeType) => ({ mimeType })),
          },
        },
      },
      include: { allowedFileTypes: true },
    });

    return toDto(created);
  },

  async update(id: string, input: UpdatePackageInput): Promise<SubscriptionPackageDto> {
    const pkg = await prisma.subscriptionPackage.findUnique({
      where: { id },
      include: { allowedFileTypes: true },
    });
    if (!pkg) {
      throw new HttpError(404, "PACKAGE_NOT_FOUND", "Subscription package not found");
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (input.mimeTypes && input.mimeTypes.length > 0) {
        await tx.packageFileType.deleteMany({ where: { packageId: id } });
      }

      const result = await tx.subscriptionPackage.update({
        where: { id },
        data: {
          name: input.name ?? pkg.name,
          slug: input.slug ?? pkg.slug,
          description: input.description ?? pkg.description,
          maxFolders: input.maxFolders ?? pkg.maxFolders,
          maxNestingLevel: input.maxNestingLevel ?? pkg.maxNestingLevel,
          maxFileSizeMb: input.maxFileSizeMb ?? pkg.maxFileSizeMb,
          totalFileLimit: input.totalFileLimit ?? pkg.totalFileLimit,
          filesPerFolderLimit: input.filesPerFolderLimit ?? pkg.filesPerFolderLimit,
          allowedFileTypes: input.mimeTypes
            ? {
                createMany: {
                  data: input.mimeTypes.map((mimeType) => ({ mimeType })),
                },
              }
            : undefined,
        },
        include: { allowedFileTypes: true },
      });

      return result;
    });

    return toDto(updated);
  },

  async remove(id: string): Promise<void> {
    const pkg = await prisma.subscriptionPackage.findUnique({ where: { id } });
    if (!pkg) {
      throw new HttpError(404, "PACKAGE_NOT_FOUND", "Subscription package not found");
    }

    await prisma.subscriptionPackage.delete({ where: { id } });
  },
};

