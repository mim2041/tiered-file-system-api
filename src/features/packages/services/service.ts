import { HttpError } from "@/utils/http-error";
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

  async create(input: CreatePackageInput): Promise<SubscriptionPackageDto> {
    const exists = await packageRepository.findByNameOrSlug(input.name, input.slug);
    if (exists) {
      throw new HttpError(409, "PACKAGE_CONFLICT", "Package name or slug already exists");
    }

    const created = await packageRepository.create(input);

    return toDto(created);
  },

  async update(id: string, input: UpdatePackageInput): Promise<SubscriptionPackageDto> {
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

    return toDto(updated);
  },

  async remove(id: string): Promise<void> {
    const pkg = await packageRepository.findById(id);
    if (!pkg) {
      throw new HttpError(404, "PACKAGE_NOT_FOUND", "Subscription package not found");
    }

    await packageRepository.remove(id);
  },
};

