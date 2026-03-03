import { z } from "zod";

const optionalBooleanFromQuery = z.preprocess((value) => {
  if (value === undefined) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean().optional());

const optionalDateFromQuery = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return value;
}, z.date().optional());

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const listUsersQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).max(120).optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
  isVerified: optionalBooleanFromQuery,
});

export const listEnrollmentHistoryQuerySchema = paginationQuerySchema.extend({
  userId: z.string().uuid().optional(),
  packageId: z.string().uuid().optional(),
  isActive: optionalBooleanFromQuery,
});

export const dashboardStatsQuerySchema = z.object({});

export const listAuditLogsQuerySchema = paginationQuerySchema.extend({
  actorUserId: z.string().uuid().optional(),
  actionType: z.string().trim().min(2).max(100).optional(),
  targetType: z.string().trim().min(2).max(100).optional(),
  targetId: z.string().uuid().optional(),
  from: optionalDateFromQuery,
  to: optionalDateFromQuery,
});

export type ListUsersQueryInput = z.infer<typeof listUsersQuerySchema>;
export type ListEnrollmentHistoryQueryInput = z.infer<typeof listEnrollmentHistoryQuerySchema>;
export type ListAuditLogsQueryInput = z.infer<typeof listAuditLogsQuerySchema>;

export const listUsersRequestSchema = z.object({
  query: listUsersQuerySchema,
});

export const listEnrollmentHistoryRequestSchema = z.object({
  query: listEnrollmentHistoryQuerySchema,
});

export const dashboardStatsRequestSchema = z.object({
  query: dashboardStatsQuerySchema,
});

export const listAuditLogsRequestSchema = z.object({
  query: listAuditLogsQuerySchema,
});
