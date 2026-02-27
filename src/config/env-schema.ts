import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().default("5001"),
  VERSION: z.string().default("1.0.0"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000,http://localhost:5173"),
  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 characters"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  DEFAULT_ADMIN_EMAIL: z.string().email().default("admin@saasfs.local"),
  DEFAULT_ADMIN_PASSWORD: z.string().min(8).default("ChangeMe123!"),
});

export type EnvConfig = z.infer<typeof envSchema>;

