export type UserSubscriptionDto = {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  packageSlug: string;
  startedAt: Date;
  endedAt: Date | null;
  isActive: boolean;
};

