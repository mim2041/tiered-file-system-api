import { Request, Response } from "express";
import sendResponse from "@/utils/response";
import { folderService } from "../service";
import { createFolderSchema, updateFolderSchema } from "../schemas";

export const listFoldersHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new Error("Authenticated user not found in request context");

  const parentId =
    typeof req.query.parentId === "string" && req.query.parentId.length > 0
      ? req.query.parentId
      : null;

  const data = await folderService.listForUser(userId, parentId);
  return sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: "Folders fetched",
    data,
  });
};

export const createFolderHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new Error("Authenticated user not found in request context");

  const input = createFolderSchema.parse(req.body);
  const data = await folderService.createForUser(userId, input);

  return sendResponse(req, res, {
    statusCode: 201,
    success: true,
    message: "Folder created",
    data,
  });
};

export const renameFolderHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new Error("Authenticated user not found in request context");

  const input = updateFolderSchema.parse(req.body);
  await folderService.renameForUser(userId, req.params.id, input);

  return sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: "Folder updated",
    data: null,
  });
};

export const deleteFolderHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new Error("Authenticated user not found in request context");

  await folderService.deleteForUser(userId, req.params.id);

  return sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: "Folder deleted",
    data: null,
  });
};

