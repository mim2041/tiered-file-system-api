import { Request, Response } from "express";
import sendResponse from "@/utils/response";
import { authService } from "../service";
import { loginSchema, registerSchema } from "../schemas";

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

