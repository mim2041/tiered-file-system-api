import { z } from "zod";

const CATEGORY_TO_MIME_TYPES: Record<string, string[]> = {
  image: ["image/jpeg", "image/png"],
  video: ["video/mp4"],
  pdf: ["application/pdf"],
  audio: ["audio/mpeg"],
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

const normalizeMimeTypes = (values: string[]) => {
  const result = new Set<string>();

  for (const rawValue of values) {
    const value = rawValue.trim().toLowerCase();
    if (!value) continue;

    if (value.includes("/")) {
      result.add(value);
      continue;
    }

    const mapped = CATEGORY_TO_MIME_TYPES[value];
    if (mapped?.length) {
      mapped.forEach((mimeType) => result.add(mimeType));
    }
  }

  return Array.from(result);
};

const packageLimitsSchema = z.object({
  name: z.string().min(2).max(64),
  slug: z.string().min(2).max(64).optional(),
  description: z.string().max(500).optional().nullable(),
  maxFolders: z.number().int().positive(),
  maxNestingLevel: z.number().int().positive(),
  maxFileSizeMb: z.number().int().positive(),
  totalFileLimit: z.number().int().positive(),
  filesPerFolderLimit: z.number().int().positive(),
  mimeTypes: z.array(z.string().min(1)).min(1).optional(),
  allowedFileTypes: z.array(z.string().min(1)).min(1).optional(),
});

export const createPackageSchema = packageLimitsSchema
  .superRefine((data, ctx) => {
    if (!data.mimeTypes && !data.allowedFileTypes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mimeTypes"],
        message: "Either mimeTypes or allowedFileTypes is required",
      });
    }
  })
  .transform((data) => {
    const sourceMimeTypes = data.mimeTypes ?? data.allowedFileTypes ?? [];
    const normalizedMimeTypes = normalizeMimeTypes(sourceMimeTypes);

    if (!normalizedMimeTypes.length) {
      throw new z.ZodError([
        {
          code: z.ZodIssueCode.custom,
          path: ["allowedFileTypes"],
          message: "No valid file types provided",
        },
      ]);
    }

    return {
      name: data.name,
      slug: data.slug ?? slugify(data.name),
      description: data.description ?? null,
      maxFolders: data.maxFolders,
      maxNestingLevel: data.maxNestingLevel,
      maxFileSizeMb: data.maxFileSizeMb,
      totalFileLimit: data.totalFileLimit,
      filesPerFolderLimit: data.filesPerFolderLimit,
      mimeTypes: normalizedMimeTypes,
    };
  });

export const updatePackageSchema = packageLimitsSchema.partial().transform((data) => {
  const sourceMimeTypes = data.mimeTypes ?? data.allowedFileTypes;

  return {
    ...data,
    mimeTypes: sourceMimeTypes ? normalizeMimeTypes(sourceMimeTypes) : undefined,
    allowedFileTypes: undefined,
  };
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;

// validateRequest-compatible schemas
export const createPackageRequestSchema = z.object({
  body: createPackageSchema,
});

export const updatePackageRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: updatePackageSchema,
});

