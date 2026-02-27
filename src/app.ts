import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env-config";
import { swaggerSpec } from "./config/swagger.config";
import { errorMiddleware } from "./middleware/error.middleware";
import { notFoundMiddleware } from "./middleware/not-found.middleware";
import sendResponse from "./utils/response";
import { APP_NAME } from "./constants";
import router from "./routes";

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
  app.use("/api/v1", router);

  // Base health + info routes
  app.get("/health", (req, res) =>
    sendResponse(req, res, {
      statusCode: 200,
      success: true,
      message: "OK",
      data: {
        app: APP_NAME,
        version: env.version,
        env: env.nodeEnv,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    }),
  );

  app.get("/", (req, res) =>
    sendResponse(req, res, {
      statusCode: 200,
      success: true,
      message: "SaaS File Management System API",
      data: {
        app: APP_NAME,
        version: env.version,
      },
    }),
  );

  // Feature routers will be mounted here in later milestones under /api/v1/*

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};