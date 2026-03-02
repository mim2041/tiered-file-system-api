import { Request, Response } from "express";
import sendResponse from "@/utils/response";
import { authService } from "../service";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "../schemas";

export const meHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new Error("Authenticated user not found in request context");

  const data = await authService.getMe(userId);

  return sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: "Current user fetched",
    data,
  });
};

export const registerHandler = async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const result = await authService.register(input);
  return sendResponse(req, res, {
    statusCode: 201,
    success: true,
    message: "Registration successful",
    data: result,
  });
};

export const loginHandler = async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input);
  return sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: "Login successful",
    data: result,
  });
};

export const resendVerificationHandler = async (req: Request, res: Response) => {
  const input = resendVerificationSchema.parse(req.body);
  const data = await authService.resendVerificationToken(input);

  return sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: "If the account exists, a verification token has been issued",
    data,
  });
};

export const verifyEmailHandler = async (req: Request, res: Response) => {
  const input = verifyEmailSchema.parse(req.body);
  const data = await authService.verifyEmail(input);

  return sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: "Email verified successfully",
    data,
  });
};

export const forgotPasswordHandler = async (req: Request, res: Response) => {
  const input = forgotPasswordSchema.parse(req.body);
  const data = await authService.forgotPassword(input);

  return sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: "If the account exists, a password reset token has been issued",
    data,
  });
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
  const input = resetPasswordSchema.parse(req.body);
  const data = await authService.resetPassword(input);

  return sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: "Password reset successful",
    data,
  });
};

