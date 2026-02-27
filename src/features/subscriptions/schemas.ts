import { z } from "zod";

export const activateSubscriptionSchema = z.object({
  packageId: z.string().uuid(),
});

export const activateSubscriptionRequestSchema = z.object({
  body: activateSubscriptionSchema,
});

export type ActivateSubscriptionInput = z.infer<typeof activateSubscriptionSchema>;

