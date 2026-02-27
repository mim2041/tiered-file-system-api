import { z } from "zod";

export const uploadFileSchema = z.object({
  folderId: z.string().uuid().nullable().optional(),
});

export const renameFileSchema = z.object({
  filename: z.string().min(1).max(255),
});

export const uploadFileRequestSchema = z.object({
  body: uploadFileSchema,
});

export const renameFileRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: renameFileSchema,
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type RenameFileInput = z.infer<typeof renameFileSchema>;

