import { Server } from "http";
import { createApp } from "./app";
import { env } from "./config/env-config";
import { prisma } from "./config/prisma.config";

let server: Server | undefined;

const bootstrap = async () => {
  try {
    await prisma.$connect();

    const app = createApp();
    server = app.listen(env.port, () => {
      console.log(`🚀 ${env.nodeEnv} server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  try {
    await prisma.$disconnect();
    if (server) {
      server.close(() => {
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error("Error during shutdown", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

void bootstrap();

