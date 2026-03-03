import { Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma.config";

export const auditRepository = {
  create(data: {
    actorUserId: string;
    actionType: string;
    targetType: string;
    targetId: string;
    metaJson?: Prisma.InputJsonValue;
  }) {
    return prisma.auditLog.create({
      data: {
        actorUserId: data.actorUserId,
        actionType: data.actionType,
        targetType: data.targetType,
        targetId: data.targetId,
        metaJson: data.metaJson,
      },
    });
  },
};
