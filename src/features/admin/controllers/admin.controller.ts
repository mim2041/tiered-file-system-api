import { Request, Response } from "express";
import sendResponse from "@/utils/response";
import { adminService } from "../service";
import {
  listAuditLogsQuerySchema,
  listEnrollmentHistoryQuerySchema,
  listUsersQuerySchema,
} from "../schemas";

export const listUsersHandler = async (req: Request, res: Response) => {
  const query = listUsersQuerySchema.parse(req.query);
  const result = await adminService.listUsers(query);

  return sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: "Users fetched",
    meta: result.meta,
    data: result.data,
  });
};

export const listEnrollmentHistoryHandler = async (req: Request, res: Response) => {
  const query = listEnrollmentHistoryQuerySchema.parse(req.query);
  const result = await adminService.listEnrollmentHistory(query);

  return sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: "Subscription enrollment history fetched",
    meta: result.meta,
    data: result.data,
  });
};

export const getDashboardStatsHandler = async (req: Request, res: Response) => {
  const data = await adminService.getDashboardStats();

  return sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: "Dashboard stats fetched",
    data,
  });
};

export const listAuditLogsHandler = async (req: Request, res: Response) => {
  const query = listAuditLogsQuerySchema.parse(req.query);
  const result = await adminService.listAuditLogs(query);

  return sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: "Audit logs fetched",
    meta: result.meta,
    data: result.data,
  });
};
