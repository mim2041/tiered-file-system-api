import { z } from "zod";

export const basePackageSchema = z.object({
  name: z.string().min(2).max(64),
  slug: z.string().min(2).max(64),
  description: z.string().max(500).optional().nullable(),
  maxFolders: z.number().int().positive(),
  maxNestingLevel: z.number().int().positive(),
  maxFileSizeMb: z.number().int().positive(),
  totalFileLimit: z.number().int().positive(),
  filesPerFolderLimit: z.number().int().positive(),
  mimeTypes: z.array(z.string().min(1)).min(1),
});

export const createPackageSchema = basePackageSchema;

export const updatePackageSchema = basePackageSchema.partial();

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;

