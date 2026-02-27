import { Request, Response } from "express";

export const notFoundMiddleware = (req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    code: "NOT_FOUND",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

