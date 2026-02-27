import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env-config";
import { swaggerSpec } from "./config/swagger.config";
import { errorMiddleware } from "./middleware/error.middleware";
import { notFoundMiddleware } from "./middleware/not-found.middleware";
import { sendOk } from "./utils/response";
import { APP_NAME } from "./constants";
import { authRouter } from "./features/auth/routes";
import { packageRouter, adminPackageRouter } from "./features/packages/routes";

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use(
    cors({
      origin: env.allowedOrigins,
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Swagger docs
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Feature routes
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/packages", packageRouter);
  app.use("/api/v1/admin/packages", adminPackageRouter);

  // Base health + info routes
  app.get("/health", (req, res) =>
    sendOk(res, "OK", {
      app: APP_NAME,
      version: env.version,
      env: env.nodeEnv,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
  );

  app.get("/", (req, res) =>
    sendOk(res, "SaaS File Management System API", {
      app: APP_NAME,
      version: env.version,
    }),
  );

  // Feature routers will be mounted here in later milestones under /api/v1/*

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};