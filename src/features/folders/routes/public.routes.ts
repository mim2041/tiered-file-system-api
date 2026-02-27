import { Router } from "express";
import catchAsync from "@/utils/catchAsync";
import validateRequest from "@/middleware/validateRequest";
import { authGuard } from "@/middleware/auth.guard";
import { requireRole } from "@/middleware/rbac.middleware";
import {
  createFolderRequestSchema,
  updateFolderRequestSchema,
} from "../schemas";
import {
  createFolderHandler,
  deleteFolderHandler,
  listFoldersHandler,
  renameFolderHandler,
} from "../controllers/public.controller";

export const publicFolderRouter = Router();

/**
 * @openapi
 * /api/v1/folders:
 *   get:
 *     tags: [Folders]
 *     summary: List folders for the current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *         description: Parent folder ID. If omitted, lists root folders.
 *     responses:
 *       200:
 *         description: Folders fetched
 */
publicFolderRouter.get(
  "/",
  authGuard,
  requireRole("USER", "ADMIN"),
  catchAsync(listFoldersHandler),
);

/**
 * @openapi
 * /api/v1/folders:
 *   post:
 *     tags: [Folders]
 *     summary: Create a new folder for the current user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               parentId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Folder created
 */
publicFolderRouter.post(
  "/",
  authGuard,
  requireRole("USER", "ADMIN"),
  validateRequest(createFolderRequestSchema),
  catchAsync(createFolderHandler),
);

/**
 * @openapi
 * /api/v1/folders/{id}:
 *   patch:
 *     tags: [Folders]
 *     summary: Rename a folder
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
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Folder updated
 *   delete:
 *     tags: [Folders]
 *     summary: Delete a folder
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
 *         description: Folder deleted
 */
publicFolderRouter.patch(
  "/:id",
  authGuard,
  requireRole("USER", "ADMIN"),
  validateRequest(updateFolderRequestSchema),
  catchAsync(renameFolderHandler),
);

publicFolderRouter.delete(
  "/:id",
  authGuard,
  requireRole("USER", "ADMIN"),
  catchAsync(deleteFolderHandler),
);

