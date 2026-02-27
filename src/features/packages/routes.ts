import { Router } from "express";
import {
  createPackageHandler,
  deletePackageHandler,
  listPackagesHandler,
  updatePackageHandler,
} from "./controller";

export const packageRouter = Router();
export const adminPackageRouter = Router();

/**
 * @openapi
 * /api/v1/packages:
 *   get:
 *     tags: [Packages]
 *     summary: List all subscription packages (public)
 *     responses:
 *       200:
 *         description: List of packages
 */
packageRouter.get("/", listPackagesHandler);

/**
 * @openapi
 * /api/v1/admin/packages:
 *   post:
 *     tags: [Packages]
 *     summary: Create a new subscription package (admin)
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
 *       200:
 *         description: Package created
 */
adminPackageRouter.post("/", createPackageHandler);

/**
 * @openapi
 * /api/v1/admin/packages/{id}:
 *   put:
 *     tags: [Packages]
 *     summary: Update a subscription package (admin)
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
adminPackageRouter.put("/:id", updatePackageHandler);
adminPackageRouter.delete("/:id", deletePackageHandler);

