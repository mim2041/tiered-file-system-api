export type FileDto = {
  id: string;
  ownerId: string;
  folderId: string | null;
  filename: string;
  originalName: string;
  sizeBytes: string;
  mimeType: string;
  storageKey: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

