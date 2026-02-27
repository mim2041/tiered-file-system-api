import { Request, Response } from "express";
import { ZodError } from "zod";
import { sendOk } from "@/utils/response";
import { HttpError } from "@/utils/http-error";
import { packageService } from "./service";
import { createPackageSchema, updatePackageSchema } from "./schemas";

export const listPackagesHandler = async (_req: Request, res: Response) => {
  const data = await packageService.listPublic();
  return sendOk(res, "Packages fetched", data);
};

export const createPackageHandler = async (req: Request, res: Response) => {
  try {
    const input = createPackageSchema.parse(req.body);
    const data = await packageService.create(input);
    return sendOk(res, "Package created", data);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Invalid package data",
        details: error.flatten(),
      });
    }
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        code: error.code,
        message: error.message,
      });
    }
    throw error;
  }
};

export const updatePackageHandler = async (req: Request, res: Response) => {
  try {
    const input = updatePackageSchema.parse(req.body);
    const data = await packageService.update(req.params.id, input);
    return sendOk(res, "Package updated", data);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Invalid package data",
        details: error.flatten(),
      });
    }
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        code: error.code,
        message: error.message,
      });
    }
    throw error;
  }
};

export const deletePackageHandler = async (req: Request, res: Response) => {
  try {
    await packageService.remove(req.params.id);
    return sendOk(res, "Package deleted");
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({
        success: false,
        code: error.code,
        message: error.message,
      });
    }
    throw error;
  }
};

