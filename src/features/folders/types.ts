export type FolderDto = {
  id: string;
  ownerId: string;
  parentId: string | null;
  name: string;
  path: string;
  depth: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

