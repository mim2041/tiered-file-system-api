import { prisma } from "@/config/prisma.config";

export const subscriptionRepository = {
  async activate(userId: string, packageId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.userSubscription.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false, endedAt: new Date() },
      });

      return tx.userSubscription.create({
        data: {
          userId,
          packageId,
          isActive: true,
        },
        include: {
          package: true,
        },
      });
    });
  },

  listByUserId(userId: string) {
    return prisma.userSubscription.findMany({
      where: { userId },
      include: {
        package: true,
      },
      orderBy: { startedAt: "desc" },
    });
  },
};

