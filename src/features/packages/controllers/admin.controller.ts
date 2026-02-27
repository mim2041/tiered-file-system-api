import { Request, Response } from "express";
import sendResponse from "@/utils/response";
import { packageService } from "../services/service";
import { createPackageSchema, updatePackageSchema } from "../schemas/schemas";

export const createPackageHandler = async (req: Request, res: Response) => {
  const input = createPackageSchema.parse(req.body);
  const data = await packageService.create(input);
  return sendResponse(req, res, {
    statusCode: 201,
    success: true,
    message: "Package created",
    data,
  });
};

export const updatePackageHandler = async (req: Request, res: Response) => {
  const input = updatePackageSchema.parse(req.body);
  const data = await packageService.update(req.params.id, input);
  return sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: "Package updated",
    data,
  });
};

export const deletePackageHandler = async (req: Request, res: Response) => {
  await packageService.remove(req.params.id);
  return sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: "Package deleted",
    data: null,
  });
};

