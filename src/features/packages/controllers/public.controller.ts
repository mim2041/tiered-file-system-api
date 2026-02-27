import { Request, Response } from "express";
import sendResponse from "@/utils/response";
import { packageService } from "../services/service";

export const listPackagesHandler = async (req: Request, res: Response) => {
  const data = await packageService.listPublic();
  return sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: "Packages fetched",
    data,
  });
};

