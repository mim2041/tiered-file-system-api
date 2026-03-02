import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const resendVerificationSchema = z.object({
  email: z.string().email(),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(16).max(256),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(16).max(256),
  password: z.string().min(8).max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// validateRequest-compatible schemas
export const registerRequestSchema = z.object({
  body: registerSchema,
});

export const loginRequestSchema = z.object({
  body: loginSchema,
});

export const resendVerificationRequestSchema = z.object({
  body: resendVerificationSchema,
});

export const verifyEmailRequestSchema = z.object({
  body: verifyEmailSchema,
});

export const forgotPasswordRequestSchema = z.object({
  body: forgotPasswordSchema,
});

export const resetPasswordRequestSchema = z.object({
  body: resetPasswordSchema,
});

