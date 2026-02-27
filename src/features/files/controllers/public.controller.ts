import { Request, Response } from "express";
import { fileService } from "../services/file.service";

export const listFiles = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const folderId = (req.query.folderId as string | undefined) ?? null;

  const files = await fileService.listFilesForUser(userId, folderId);

  res.status(200).json({
    success: true,
    message: "Files retrieved successfully",
    data: files,
  });
};

export const uploadFile = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const payload = req.body;

  const file = await fileService.uploadFileForUser(userId, payload, req.file);

  res.status(201).json({
    success: true,
    message: "File uploaded successfully",
    data: file,
  });
};

export const renameFile = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const payload = req.body;

  await fileService.renameFileForUser(userId, id, payload);

  res.status(200).json({
    success: true,
    message: "File renamed successfully",
  });
};

export const deleteFile = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  await fileService.deleteFileForUser(userId, id);

  res.status(200).json({
    success: true,
    message: "File deleted successfully",
  });
};

