import { NextFunction, Request, Response } from "express";

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
  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? "INTERNAL_SERVER_ERROR";

  return res.status(statusCode).json({
    success: false,
    code,
    message: err.message || "Something went wrong",
    details: err.details ?? null,
  });
};

