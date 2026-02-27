import { HttpError } from "@/utils/http-error";
import { packageRepository } from "@/features/packages/repositories/package.repository";
import { subscriptionRepository } from "./repositories/subscription.repository";
import { ActivateSubscriptionInput } from "./schemas";
import { UserSubscriptionDto } from "./types";

const toDto = (row: any): UserSubscriptionDto => ({
  id: row.id,
  userId: row.userId,
  packageId: row.packageId,
  packageName: row.package?.name,
  packageSlug: row.package?.slug,
  startedAt: row.startedAt,
  endedAt: row.endedAt,
  isActive: row.isActive,
});

export const subscriptionService = {
  async activateForUser(userId: string, input: ActivateSubscriptionInput): Promise<UserSubscriptionDto> {
    const pkg = await packageRepository.findById(input.packageId);
    if (!pkg) {
      throw new HttpError(404, "PACKAGE_NOT_FOUND", "Subscription package not found");
    }

    const row = await subscriptionRepository.activate(userId, input.packageId);
    return toDto(row);
  },

  async listUserHistory(userId: string): Promise<UserSubscriptionDto[]> {
    const rows = await subscriptionRepository.listByUserId(userId);
    return rows.map(toDto);
  },
};

