import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { env } from "@/config/env-config";
import { HttpError } from "@/utils/http-error";
import {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResendVerificationInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "./schemas";
import { AuthResponse, AuthTokens, PublicUser } from "./types";
import { userRepository } from "./repositories/user.repository";
import { subscriptionRepository } from "@/features/subscriptions/repositories/subscription.repository";

const EMAIL_TOKEN_TTL_MS = 1000 * 60 * 60 * 24;
const RESET_TOKEN_TTL_MS = 1000 * 60 * 30;

const createToken = () => crypto.randomBytes(32).toString("hex");

const issueEmailVerificationToken = async (userId: string): Promise<string> => {
  const token = createToken();
  const expiresAt = new Date(Date.now() + EMAIL_TOKEN_TTL_MS);

  await userRepository.deleteEmailVerificationTokensByUserId(userId);
  await userRepository.createEmailVerificationToken({ userId, token, expiresAt });

  return token;
};

const issuePasswordResetToken = async (userId: string): Promise<string> => {
  const token = createToken();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await userRepository.deletePasswordResetTokensByUserId(userId);
  await userRepository.createPasswordResetToken({ userId, token, expiresAt });

  return token;
};

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

const buildTokens = (userId: string, email: string, role: "ADMIN" | "USER"): AuthTokens => {
  const accessOptions: SignOptions = {
    subject: userId,
    expiresIn: env.jwt.accessExpiresIn as SignOptions["expiresIn"],
  };

  const refreshOptions: SignOptions = {
    subject: userId,
    expiresIn: env.jwt.refreshExpiresIn as SignOptions["expiresIn"],
  };

  const accessToken = jwt.sign({ role, email }, env.jwt.accessSecret, accessOptions);
  const refreshToken = jwt.sign({ role, email }, env.jwt.refreshSecret, refreshOptions);

  return { accessToken, refreshToken };
};

export const authService = {
  async getMe(userId: string): Promise<{
    user: PublicUser;
    activeSubscription: {
      id: string;
      packageId: string;
      packageName: string;
      packageSlug: string;
      startedAt: Date;
    } | null;
  }> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new HttpError(404, "USER_NOT_FOUND", "User not found");
    }

    const activeSubscription = await subscriptionRepository.findActiveByUserId(userId);

    return {
      user: toPublicUser(user),
      activeSubscription: activeSubscription
        ? {
            id: activeSubscription.id,
            packageId: activeSubscription.packageId,
            packageName: activeSubscription.package.name,
            packageSlug: activeSubscription.package.slug,
            startedAt: activeSubscription.startedAt,
          }
        : null,
    };
  },

  async register(input: RegisterInput): Promise<AuthResponse> {
    const email = input.email.toLowerCase();
    const existing = await userRepository.findByEmail(email);

    if (existing) {
      throw new HttpError(409, "EMAIL_EXISTS", "Email is already registered");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const created = await userRepository.createUser({
      email,
      name: input.name,
      passwordHash,
    });

    const verificationToken = await issueEmailVerificationToken(created.id);

    const tokens = buildTokens(created.id, created.email, created.role);

    return {
      user: toPublicUser(created),
      tokens,
      verificationToken,
    };
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(input.email.toLowerCase());

    if (!user) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const tokens = buildTokens(user.id, user.email, user.role);

    return {
      user: toPublicUser(user),
      tokens,
    };
  },

  async resendVerificationToken(input: ResendVerificationInput): Promise<{ sent: boolean; token?: string }> {
    const user = await userRepository.findByEmail(input.email.toLowerCase());

    if (!user || user.isVerified) {
      return { sent: true };
    }

    const token = await issueEmailVerificationToken(user.id);
    return { sent: true, token };
  },

  async verifyEmail(input: VerifyEmailInput): Promise<{ verified: boolean }> {
    const row = await userRepository.findEmailVerificationToken(input.token);
    if (!row || row.expiresAt < new Date()) {
      throw new HttpError(400, "INVALID_OR_EXPIRED_TOKEN", "Verification token is invalid or expired");
    }

    await userRepository.markVerified(row.userId);
    await userRepository.deleteEmailVerificationTokensByUserId(row.userId);

    return { verified: true };
  },

  async forgotPassword(input: ForgotPasswordInput): Promise<{ sent: boolean; token?: string }> {
    const user = await userRepository.findByEmail(input.email.toLowerCase());

    if (!user) {
      return { sent: true };
    }

    const token = await issuePasswordResetToken(user.id);
    return { sent: true, token };
  },

  async resetPassword(input: ResetPasswordInput): Promise<{ reset: boolean }> {
    const row = await userRepository.findPasswordResetToken(input.token);
    if (!row || row.expiresAt < new Date()) {
      throw new HttpError(400, "INVALID_OR_EXPIRED_TOKEN", "Reset token is invalid or expired");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    await userRepository.updatePasswordHash(row.userId, passwordHash);
    await userRepository.deletePasswordResetTokensByUserId(row.userId);

    return { reset: true };
  },
};

