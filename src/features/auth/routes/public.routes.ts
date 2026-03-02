import { Router } from "express";
import catchAsync from "@/utils/catchAsync";
import validateRequest from "@/middleware/validateRequest";
import { authGuard } from "@/middleware/auth.guard";
import {
  forgotPasswordRequestSchema,
  loginRequestSchema,
  registerRequestSchema,
  resendVerificationRequestSchema,
  resetPasswordRequestSchema,
  verifyEmailRequestSchema,
} from "../schemas";
import {
  forgotPasswordHandler,
  loginHandler,
  meHandler,
  registerHandler,
  resendVerificationHandler,
  resetPasswordHandler,
  verifyEmailHandler,
} from "../controllers/public.controller";

export const publicAuthRouter = Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful
 */
publicAuthRouter.post(
  "/register",
  validateRequest(registerRequestSchema),
  catchAsync(registerHandler),
);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
publicAuthRouter.post("/login", validateRequest(loginRequestSchema), catchAsync(loginHandler));

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user profile and active package
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user fetched
 */
publicAuthRouter.get("/me", authGuard, catchAsync(meHandler));

/**
 * @openapi
 * /api/v1/auth/verify-email/resend:
 *   post:
 *     tags: [Auth]
 *     summary: Resend email verification token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification token issued if account is eligible
 */
publicAuthRouter.post(
  "/verify-email/resend",
  validateRequest(resendVerificationRequestSchema),
  catchAsync(resendVerificationHandler),
);

/**
 * @openapi
 * /api/v1/auth/verify-email:
 *   post:
 *     tags: [Auth]
 *     summary: Verify user email with token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified
 */
publicAuthRouter.post(
  "/verify-email",
  validateRequest(verifyEmailRequestSchema),
  catchAsync(verifyEmailHandler),
);

/**
 * @openapi
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset token issued if account exists
 */
publicAuthRouter.post(
  "/forgot-password",
  validateRequest(forgotPasswordRequestSchema),
  catchAsync(forgotPasswordHandler),
);

/**
 * @openapi
 * /api/v1/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
publicAuthRouter.post(
  "/reset-password",
  validateRequest(resetPasswordRequestSchema),
  catchAsync(resetPasswordHandler),
);

