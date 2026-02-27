import { Router } from "express";
import catchAsync from "@/utils/catchAsync";
import validateRequest from "@/middleware/validateRequest";
import { authGuard } from "@/middleware/auth.guard";
import { requireRole } from "@/middleware/rbac.middleware";
import { activateSubscriptionRequestSchema } from "../schemas";
import {
  activateSubscriptionHandler,
  listMySubscriptionsHandler,
} from "../controllers/public.controller";

export const publicSubscriptionRouter = Router();

/**
 * @openapi
 * /api/v1/subscriptions/activate:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Activate a subscription package for the current user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [packageId]
 *             properties:
 *               packageId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Subscription activated
 */
publicSubscriptionRouter.post(
  "/activate",
  authGuard,
  requireRole("USER", "ADMIN"),
  validateRequest(activateSubscriptionRequestSchema),
  catchAsync(activateSubscriptionHandler),
);

/**
 * @openapi
 * /api/v1/subscriptions/me:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Get subscription history for the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription history
 */
publicSubscriptionRouter.get(
  "/me",
  authGuard,
  requireRole("USER", "ADMIN"),
  catchAsync(listMySubscriptionsHandler),
);

