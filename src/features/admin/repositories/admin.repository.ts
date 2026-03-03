import { Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma.config";

export const adminRepository = {
  countUsers(where: Prisma.UserWhereInput) {
    return prisma.user.count({ where });
  },

  listUsers(where: Prisma.UserWhereInput, skip: number, take: number) {
    return prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        subscriptions: {
          where: { isActive: true },
          orderBy: { startedAt: "desc" },
          take: 1,
          select: {
            id: true,
            packageId: true,
            startedAt: true,
            package: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  },

  countEnrollmentHistory(where: Prisma.UserSubscriptionWhereInput) {
    return prisma.userSubscription.count({ where });
  },

  listEnrollmentHistory(where: Prisma.UserSubscriptionWhereInput, skip: number, take: number) {
    return prisma.userSubscription.findMany({
      where,
      orderBy: { startedAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        userId: true,
        packageId: true,
        startedAt: true,
        endedAt: true,
        isActive: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        package: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });
  },

  async getDashboardStats() {
    const [
      totalUsers,
      totalVerifiedUsers,
      totalPackages,
      activeSubscriptions,
      totalFiles,
      totalFolders,
      totalStorage,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { isVerified: true } }),
      prisma.subscriptionPackage.count(),
      prisma.userSubscription.count({ where: { isActive: true } }),
      prisma.file.count({ where: { isDeleted: false } }),
      prisma.folder.count({ where: { isDeleted: false } }),
      prisma.file.aggregate({ where: { isDeleted: false }, _sum: { sizeBytes: true } }),
    ]);

    return {
      totalUsers,
      totalVerifiedUsers,
      totalPackages,
      activeSubscriptions,
      totalFiles,
      totalFolders,
      totalStorageBytes: totalStorage._sum.sizeBytes ?? 0n,
    };
  },

  countAuditLogs(where: Prisma.AuditLogWhereInput) {
    return prisma.auditLog.count({ where });
  },

  listAuditLogs(where: Prisma.AuditLogWhereInput, skip: number, take: number) {
    return prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        actorUserId: true,
        actionType: true,
        targetType: true,
        targetId: true,
        metaJson: true,
        createdAt: true,
        actor: {
          select: {
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });
  },
};
