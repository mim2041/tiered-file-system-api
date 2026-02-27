import { z } from "zod";

export const createFolderSchema = z.object({
  name: z.string().min(1).max(128),
  parentId: z.string().uuid().nullable().optional(),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1).max(128),
});

export const createFolderRequestSchema = z.object({
  body: createFolderSchema,
});

export const updateFolderRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: updateFolderSchema,
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;

