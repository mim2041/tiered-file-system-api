import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "@/config/env-config";
import { HttpError } from "@/utils/http-error";
import { LoginInput, RegisterInput } from "./schemas";
import { AuthResponse, AuthTokens, PublicUser } from "./types";
import { userRepository } from "./repositories/user.repository";

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

    const tokens = buildTokens(created.id, created.email, created.role);

    return {
      user: toPublicUser(created),
      tokens,
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
};

