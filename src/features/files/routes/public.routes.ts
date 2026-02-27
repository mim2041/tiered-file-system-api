import { Router } from "express";
import { authGuard } from "@/middleware/auth.guard";
import validateRequest from "@/middleware/validateRequest";
import { upload, handleMulterError } from "@/middleware/upload";
import catchAsync from "@/utils/catchAsync";
import {
  deleteFile,
  listFiles,
  renameFile,
  uploadFile,
} from "../controllers/public.controller";
import {
  renameFileRequestSchema,
  uploadFileRequestSchema,
} from "../schemas";

export const publicFileRouter = Router();

/**
 * @openapi
 * /api/v1/files:
 *   get:
 *     tags:
 *       - Files
 *     summary: List files for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: folderId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *         description: Filter files by folder
 *     responses:
 *       200:
 *         description: Files retrieved successfully
 *   post:
 *     tags:
 *       - Files
 *     summary: Upload a new file
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folderId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *
 * /api/v1/files/{id}:
 *   patch:
 *     tags:
 *       - Files
 *     summary: Rename a file
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *     responses:
 *       200:
 *         description: File renamed successfully
 *   delete:
 *     tags:
 *       - Files
 *     summary: Delete a file
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: File deleted successfully
 */

publicFileRouter.get(
  "/",
  authGuard,
  catchAsync(listFiles),
);

publicFileRouter.post(
  "/",
  authGuard,
  upload.single("file"),
  handleMulterError,
  validateRequest(uploadFileRequestSchema),
  catchAsync(uploadFile),
);

publicFileRouter.patch(
  "/:id",
  authGuard,
  validateRequest(renameFileRequestSchema),
  catchAsync(renameFile),
);

publicFileRouter.delete(
  "/:id",
  authGuard,
  catchAsync(deleteFile),
);

