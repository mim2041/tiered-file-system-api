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

/**
 * @openapi
 * /api/v1/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List users for admin portal
 *     description: Returns paginated users with optional search/filter and active subscription snapshot.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Partial search by user name or email.
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, USER]
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Users fetched
 */
adminManagementRouter.get(
  "/users",
  validateRequest(listUsersRequestSchema),
  catchAsync(listUsersHandler),
);

/**
 * @openapi
 * /api/v1/admin/subscriptions/enrollments:
 *   get:
 *     tags: [Admin]
 *     summary: List subscription enrollment history
 *     description: Returns paginated user subscription records, globally or filtered by user/package.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: packageId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Subscription enrollment history fetched
 */
adminManagementRouter.get(
  "/subscriptions/enrollments",
  validateRequest(listEnrollmentHistoryRequestSchema),
  catchAsync(listEnrollmentHistoryHandler),
);

/**
 * @openapi
 * /api/v1/admin/dashboard/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin dashboard home stats
 *     description: Returns top-level metrics used by admin portal dashboard cards.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats fetched
 */
adminManagementRouter.get(
  "/dashboard/stats",
  validateRequest(dashboardStatsRequestSchema),
  catchAsync(getDashboardStatsHandler),
);

/**
 * @openapi
 * /api/v1/admin/audit-logs:
 *   get:
 *     tags: [Admin]
 *     summary: List audit logs
 *     description: Returns paginated audit events for admin actions and other tracked operations.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: actorUserId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: actionType
 *         schema:
 *           type: string
 *       - in: query
 *         name: targetType
 *         schema:
 *           type: string
 *       - in: query
 *         name: targetId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Audit logs fetched
 */
adminManagementRouter.get(
  "/audit-logs",
  validateRequest(listAuditLogsRequestSchema),
  catchAsync(listAuditLogsHandler),
);
