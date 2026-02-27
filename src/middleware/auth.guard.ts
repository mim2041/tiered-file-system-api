import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/config/env-config";
import { HttpError } from "@/utils/http-error";

export interface AuthUser {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

export const authGuard = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new HttpError(401, "AUTH_REQUIRED", "Authentication required"));
  }

  const token = header.substring("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.jwt.accessSecret) as any;
    req.user = {
      id: payload.sub as string,
      email: payload.email,
      role: payload.role,
    };
    return next();
  } catch (e) {
    return next(new HttpError(401, "AUTH_INVALID", "Invalid or expired token"));
  }
};

