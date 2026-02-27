import dotenv from "dotenv";
import path from "path";
import { envSchema } from "./env-schema";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

const envData = parsed.data;

export const env = {
  nodeEnv: envData.NODE_ENV,
  port: Number(envData.PORT),
  version: envData.VERSION,
  databaseUrl: envData.DATABASE_URL,
  allowedOrigins: envData.ALLOWED_ORIGINS.split(",").map((o) => o.trim()),
  jwt: {
    accessSecret: envData.JWT_ACCESS_SECRET,
    refreshSecret: envData.JWT_REFRESH_SECRET,
    accessExpiresIn: envData.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: envData.JWT_REFRESH_EXPIRES_IN,
  },
  defaultAdmin: {
    email: envData.DEFAULT_ADMIN_EMAIL,
    password: envData.DEFAULT_ADMIN_PASSWORD,
  },
} as const;

