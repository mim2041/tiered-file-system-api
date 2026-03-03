import { Prisma } from "@prisma/client";
import { adminRepository } from "./repositories/admin.repository";
import {
  ListAuditLogsQueryInput,
  ListEnrollmentHistoryQueryInput,
  ListUsersQueryInput,
} from "./schemas";

const buildPagination = (page: number, limit: number) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const skip = (safePage - 1) * safeLimit;
  return {
    page: safePage,
    limit: safeLimit,
    skip,
  };
};

export const adminService = {
  async listUsers(query: ListUsersQueryInput) {
    const pagination = buildPagination(query.page, query.limit);

    const where: Prisma.UserWhereInput = {
      role: query.role,
      isVerified: query.isVerified,
      OR: query.search
        ? [
            { email: { contains: query.search, mode: "insensitive" } },
            { name: { contains: query.search, mode: "insensitive" } },
          ]
        : undefined,
    };

    const [total, rows] = await Promise.all([
      adminRepository.countUsers(where),
      adminRepository.listUsers(where, pagination.skip, pagination.limit),
    ]);

    const data = rows.map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      isVerified: row.isVerified,
      activeSubscription: row.subscriptions[0]
        ? {
            id: row.subscriptions[0].id,
            packageId: row.subscriptions[0].packageId,
            packageName: row.subscriptions[0].package.name,
            packageSlug: row.subscriptions[0].package.slug,
            startedAt: row.subscriptions[0].startedAt,
          }
        : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    return {
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPage: Math.ceil(total / pagination.limit),
      },
      data,
    };
  },

  async listEnrollmentHistory(query: ListEnrollmentHistoryQueryInput) {
    const pagination = buildPagination(query.page, query.limit);

    const where: Prisma.UserSubscriptionWhereInput = {
      userId: query.userId,
      packageId: query.packageId,
      isActive: query.isActive,
    };

    const [total, rows] = await Promise.all([
      adminRepository.countEnrollmentHistory(where),
      adminRepository.listEnrollmentHistory(where, pagination.skip, pagination.limit),
    ]);

    return {
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPage: Math.ceil(total / pagination.limit),
      },
      data: rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        userEmail: row.user.email,
        userName: row.user.name,
        packageId: row.packageId,
        packageName: row.package.name,
        packageSlug: row.package.slug,
        startedAt: row.startedAt,
        endedAt: row.endedAt,
        isActive: row.isActive,
      })),
    };
  },

  async getDashboardStats() {
    const stats = await adminRepository.getDashboardStats();

    return {
      totalUsers: stats.totalUsers,
      totalVerifiedUsers: stats.totalVerifiedUsers,
      totalPackages: stats.totalPackages,
      activeSubscriptions: stats.activeSubscriptions,
      totalFiles: stats.totalFiles,
      totalFolders: stats.totalFolders,
      totalStorageBytes: stats.totalStorageBytes.toString(),
    };
  },

  async listAuditLogs(query: ListAuditLogsQueryInput) {
    const pagination = buildPagination(query.page, query.limit);

    const where: Prisma.AuditLogWhereInput = {
      actorUserId: query.actorUserId,
      actionType: query.actionType,
      targetType: query.targetType,
      targetId: query.targetId,
      createdAt:
        query.from || query.to
          ? {
              gte: query.from,
              lte: query.to,
            }
          : undefined,
    };

    const [total, rows] = await Promise.all([
      adminRepository.countAuditLogs(where),
      adminRepository.listAuditLogs(where, pagination.skip, pagination.limit),
    ]);

    return {
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPage: Math.ceil(total / pagination.limit),
      },
      data: rows.map((row) => ({
        id: row.id,
        actorUserId: row.actorUserId,
        actorEmail: row.actor.email,
        actorName: row.actor.name,
        actorRole: row.actor.role,
        actionType: row.actionType,
        targetType: row.targetType,
        targetId: row.targetId,
        metaJson: row.metaJson,
        createdAt: row.createdAt,
      })),
    };
  },
};
