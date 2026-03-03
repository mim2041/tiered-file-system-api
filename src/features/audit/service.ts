import { Prisma } from "@prisma/client";
import { auditRepository } from "./repository";

export const auditService = {
  async record(data: {
    actorUserId: string;
    actionType: string;
    targetType: string;
    targetId: string;
    metaJson?: Prisma.InputJsonValue;
  }): Promise<void> {
    await auditRepository.create(data);
  },
};
