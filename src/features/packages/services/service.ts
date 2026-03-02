import { HttpError } from "@/utils/http-error";
import { Prisma } from "@prisma/client";
import { CreatePackageInput, UpdatePackageInput } from "../schemas/schemas";
import { SubscriptionPackageDto } from "../types/types";
import { packageRepository } from "../repositories/package.repository";

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
    const packages = await packageRepository.listWithTypes();
    return packages.map(toDto);
  },

  async create(input: CreatePackageInput, changedBy: string): Promise<SubscriptionPackageDto> {
    const exists = await packageRepository.findByNameOrSlug(input.name, input.slug);
    if (exists) {
      throw new HttpError(409, "PACKAGE_CONFLICT", "Package name or slug already exists");
    }

    const created = await packageRepository.create(input);

    await packageRepository.createHistory({
      packageId: created.id,
      changedBy,
      oldData: null,
      newData: {
        name: created.name,
        slug: created.slug,
        description: created.description,
        maxFolders: created.maxFolders,
        maxNestingLevel: created.maxNestingLevel,
        maxFileSizeMb: created.maxFileSizeMb,
        totalFileLimit: created.totalFileLimit,
        filesPerFolderLimit: created.filesPerFolderLimit,
        mimeTypes: created.allowedFileTypes.map((item) => item.mimeType),
      },
    });

    return toDto(created);
  },

  async update(id: string, input: UpdatePackageInput, changedBy: string): Promise<SubscriptionPackageDto> {
    const pkg = await packageRepository.findById(id);
    if (!pkg) {
      throw new HttpError(404, "PACKAGE_NOT_FOUND", "Subscription package not found");
    }

    const updated = await packageRepository.updateWithTypes(id, {
      ...input,
      // preserve existing values if not provided
      name: input.name ?? pkg.name,
      slug: input.slug ?? pkg.slug,
      description: input.description ?? pkg.description,
      maxFolders: input.maxFolders ?? pkg.maxFolders,
      maxNestingLevel: input.maxNestingLevel ?? pkg.maxNestingLevel,
      maxFileSizeMb: input.maxFileSizeMb ?? pkg.maxFileSizeMb,
      totalFileLimit: input.totalFileLimit ?? pkg.totalFileLimit,
      filesPerFolderLimit: input.filesPerFolderLimit ?? pkg.filesPerFolderLimit,
      mimeTypes: input.mimeTypes,
    });

    await packageRepository.createHistory({
      packageId: updated.id,
      changedBy,
      oldData: {
        name: pkg.name,
        slug: pkg.slug,
        description: pkg.description,
        maxFolders: pkg.maxFolders,
        maxNestingLevel: pkg.maxNestingLevel,
        maxFileSizeMb: pkg.maxFileSizeMb,
        totalFileLimit: pkg.totalFileLimit,
        filesPerFolderLimit: pkg.filesPerFolderLimit,
        mimeTypes: pkg.allowedFileTypes.map((item) => item.mimeType),
      },
      newData: {
        name: updated.name,
        slug: updated.slug,
        description: updated.description,
        maxFolders: updated.maxFolders,
        maxNestingLevel: updated.maxNestingLevel,
        maxFileSizeMb: updated.maxFileSizeMb,
        totalFileLimit: updated.totalFileLimit,
        filesPerFolderLimit: updated.filesPerFolderLimit,
        mimeTypes: updated.allowedFileTypes.map((item) => item.mimeType),
      },
    });

    return toDto(updated);
  },

  async remove(id: string): Promise<void> {
    const pkg = await packageRepository.findById(id);
    if (!pkg) {
      throw new HttpError(404, "PACKAGE_NOT_FOUND", "Subscription package not found");
    }

    try {
      await packageRepository.remove(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new HttpError(
          409,
          "PACKAGE_IN_USE",
          "This package cannot be deleted because it is referenced by subscriptions",
        );
      }

      throw error;
    }
  },
};

