import { Request, Response } from "express";
import sendResponse from "@/utils/response";
import { subscriptionService } from "../service";
import { activateSubscriptionSchema } from "../schemas";

export const activateSubscriptionHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new Error("Authenticated user not found in request context");
  }

  const input = activateSubscriptionSchema.parse(req.body);
  const data = await subscriptionService.activateForUser(userId, input);

  return sendResponse(req, res, {
    statusCode: 201,
    success: true,
    message: "Subscription activated",
    data,
  });
};

export const listMySubscriptionsHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new Error("Authenticated user not found in request context");
  }

  const data = await subscriptionService.listUserHistory(userId);
  return sendResponse(req, res, {
    statusCode: 200,
    success: true,
    message: "Subscription history fetched",
    data,
  });
};

