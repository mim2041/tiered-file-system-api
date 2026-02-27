export type SubscriptionPackageDto = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  maxFolders: number;
  maxNestingLevel: number;
  maxFileSizeMb: number;
  totalFileLimit: number;
  filesPerFolderLimit: number;
  allowedFileTypes: string[];
  createdAt: Date;
  updatedAt: Date;
};

