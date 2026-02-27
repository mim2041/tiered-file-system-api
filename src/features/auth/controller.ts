import { Request, Response } from "express";
import { ZodError } from "zod";
import { sendOk } from "@/utils/response";
import { HttpError } from "@/utils/http-error";
import { authService } from "./service";
import { loginSchema, registerSchema } from "./schemas";

export const registerHandler = async (req: Request, res: Response) => {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    return sendOk(res, "Registration successful", result);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Invalid registration data",
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

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    return sendOk(res, "Login successful", result);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: "Invalid login data",
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

