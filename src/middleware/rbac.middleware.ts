import { NextFunction, Request, Response } from "express";
import { HttpError } from "@/utils/http-error";

export const requireRole = (...roles: Array<"ADMIN" | "USER">) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError(401, "AUTH_REQUIRED", "Authentication required"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, "FORBIDDEN", "You do not have permission to perform this action"));
    }
    return next();
  };
};

// Placeholder permission middleware for later expansion
export const requirePermission = (_permission: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new HttpError(401, "AUTH_REQUIRED", "Authentication required"));
    }
    // For now: Admin has all permissions
    if (req.user.role === "ADMIN") return next();
    return next(new HttpError(403, "FORBIDDEN", "Permission denied"));
  };
};

