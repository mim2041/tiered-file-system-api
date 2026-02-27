import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "@/config/prisma.config";
import { env } from "@/config/env-config";
import { HttpError } from "@/utils/http-error";
import { LoginInput, RegisterInput } from "./schemas";
import { AuthResponse, AuthTokens, PublicUser } from "./types";

const toPublicUser = (user: {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
  isVerified: boolean;
}): PublicUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  isVerified: user.isVerified,
});

const buildTokens = (userId: string, role: "ADMIN" | "USER"): AuthTokens => {
  const accessOptions: SignOptions = {
    subject: userId,
    expiresIn: env.jwt.accessExpiresIn as SignOptions["expiresIn"],
  };

  const refreshOptions: SignOptions = {
    subject: userId,
    expiresIn: env.jwt.refreshExpiresIn as SignOptions["expiresIn"],
  };

  const accessToken = jwt.sign({ role }, env.jwt.accessSecret, accessOptions);
  const refreshToken = jwt.sign({ role }, env.jwt.refreshSecret, refreshOptions);

  return { accessToken, refreshToken };
};

export const authService = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      select: { id: true },
    });

    if (existing) {
      throw new HttpError(409, "EMAIL_EXISTS", "Email is already registered");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email.toLowerCase(),
          name: input.name,
          passwordHash,
          role: "USER",
          isVerified: false,
        },
      });

      await tx.userQuota.create({
        data: {
          userId: user.id,
        },
      });

      return user;
    });

    const tokens = buildTokens(created.id, created.role);

    return {
      user: toPublicUser(created),
      tokens,
    };
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const tokens = buildTokens(user.id, user.role);

    return {
      user: toPublicUser(user),
      tokens,
    };
  },
};

