import { Router } from "express";
import catchAsync from "@/utils/catchAsync";
import validateRequest from "@/middleware/validateRequest";
import { authGuard } from "@/middleware/auth.guard";
import { requireRole } from "@/middleware/rbac.middleware";
import { createPackageRequestSchema, updatePackageRequestSchema } from "../schemas/schemas";
import {
  createPackageHandler,
  deletePackageHandler,
  updatePackageHandler,
} from "../controllers/admin.controller";

export const adminPackageRouter = Router();

/**
 * @openapi
 * /api/v1/admin/packages:
 *   post:
 *     tags: [Packages]
 *     summary: Create a new subscription package (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *               - maxFolders
 *               - maxNestingLevel
 *               - maxFileSizeMb
 *               - totalFileLimit
 *               - filesPerFolderLimit
 *               - mimeTypes
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               maxFolders:
 *                 type: integer
 *               maxNestingLevel:
 *                 type: integer
 *               maxFileSizeMb:
 *                 type: integer
 *               totalFileLimit:
 *                 type: integer
 *               filesPerFolderLimit:
 *                 type: integer
 *               mimeTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Package created
 */
adminPackageRouter.post(
  "/",
  authGuard,
  requireRole("ADMIN"),
  validateRequest(createPackageRequestSchema),
  catchAsync(createPackageHandler),
);

/**
 * @openapi
 * /api/v1/admin/packages/{id}:
 *   put:
 *     tags: [Packages]
 *     summary: Update a subscription package (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Package updated
 *   delete:
 *     tags: [Packages]
 *     summary: Delete a subscription package (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Package deleted
 */
adminPackageRouter.put(
  "/:id",
  authGuard,
  requireRole("ADMIN"),
  validateRequest(updatePackageRequestSchema),
  catchAsync(updatePackageHandler),
);

/**
 * @openapi
 * /api/v1/admin/packages/{id}:
 *   delete:
 *     tags: [Packages]
 *     summary: Delete a subscription package (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Package deleted
 */
adminPackageRouter.delete(
  "/:id",
  authGuard,
  requireRole("ADMIN"),
  catchAsync(deletePackageHandler),
);

