import { Router } from "express";
import catchAsync from "@/utils/catchAsync";
import { listPackagesHandler } from "../controllers/public.controller";

export const publicPackageRouter = Router();

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
publicPackageRouter.get("/", catchAsync(listPackagesHandler));

