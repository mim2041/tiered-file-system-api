import { HttpError } from "@/utils/http-error";
import { folderRepository } from "./repositories/folder.repository";
import { CreateFolderInput, UpdateFolderInput } from "./schemas";
import { FolderDto } from "./types";

const buildPath = (parentPath: string | null, name: string) => {
  const sanitized = name.trim().replace(/\s+/g, "-");
  if (!parentPath) return `/${sanitized}`;
  return `${parentPath}/${sanitized}`;
};

const toDto = (folder: any): FolderDto => ({
  id: folder.id,
  ownerId: folder.ownerId,
  parentId: folder.parentId,
  name: folder.name,
  path: folder.path,
  depth: folder.depth,
  isDeleted: folder.isDeleted,
  createdAt: folder.createdAt,
  updatedAt: folder.updatedAt,
});

export const folderService = {
  async listForUser(userId: string, parentId?: string | null): Promise<FolderDto[]> {
    const resolvedParent = parentId ?? null;
    const items = await folderRepository.listByOwnerAndParent(userId, resolvedParent);
    return items.map(toDto);
  },

  async createForUser(userId: string, input: CreateFolderInput): Promise<FolderDto> {
    const parentId = input.parentId ?? null;
    let parent: any = null;

    if (parentId) {
      parent = await folderRepository.findById(userId, parentId);
      if (!parent) {
        throw new HttpError(404, "PARENT_NOT_FOUND", "Parent folder not found");
      }
    }

    const depth = parent ? parent.depth + 1 : 1;
    const path = buildPath(parent?.path ?? null, input.name);

    const created = await folderRepository.create({
      ownerId: userId,
      parentId,
      name: input.name,
      path,
      depth,
    });

    return toDto(created);
  },

  async renameForUser(userId: string, id: string, input: UpdateFolderInput): Promise<void> {
    const result = await folderRepository.rename(userId, id, input.name);
    if (result.count === 0) {
      throw new HttpError(404, "FOLDER_NOT_FOUND", "Folder not found");
    }
  },

  async deleteForUser(userId: string, id: string): Promise<void> {
    const result = await folderRepository.softDelete(userId, id);
    if (result.count === 0) {
      throw new HttpError(404, "FOLDER_NOT_FOUND", "Folder not found");
    }
  },
};

