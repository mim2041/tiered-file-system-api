import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "@/utils/http-error";

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export const errorMiddleware = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Invalid request data",
      details: err.flatten(),
    });
  }

  // Domain HTTP errors
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      details: err.details ?? null,
    });
  }

  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? "INTERNAL_SERVER_ERROR";

  return res.status(statusCode).json({
    success: false,
    code,
    message: err.message || "Something went wrong",
    details: err.details ?? null,
  });
};

