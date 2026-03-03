import { Router } from "express";
import catchAsync from "@/utils/catchAsync";
import validateRequest from "@/middleware/validateRequest";
import { authGuard } from "@/middleware/auth.guard";
import { requireRole } from "@/middleware/rbac.middleware";
import {
  getDashboardStatsHandler,
  listAuditLogsHandler,
  listEnrollmentHistoryHandler,
  listUsersHandler,
} from "../controllers/admin.controller";
import {
  dashboardStatsRequestSchema,
  listAuditLogsRequestSchema,
  listEnrollmentHistoryRequestSchema,
  listUsersRequestSchema,
} from "../schemas";

export const adminManagementRouter = Router();

adminManagementRouter.use(authGuard, requireRole("ADMIN"));

adminManagementRouter.get(
  "/users",
  validateRequest(listUsersRequestSchema),
  catchAsync(listUsersHandler),
);

adminManagementRouter.get(
  "/subscriptions/enrollments",
  validateRequest(listEnrollmentHistoryRequestSchema),
  catchAsync(listEnrollmentHistoryHandler),
);

adminManagementRouter.get(
  "/dashboard/stats",
  validateRequest(dashboardStatsRequestSchema),
  catchAsync(getDashboardStatsHandler),
);

adminManagementRouter.get(
  "/audit-logs",
  validateRequest(listAuditLogsRequestSchema),
  catchAsync(listAuditLogsHandler),
);
