import { Router } from "express";
import { publicAuthRouter } from "../features/auth/routes/public.routes";
import { publicPackageRouter } from "../features/packages/routes/public.routes";
import { adminPackageRouter } from "../features/packages/routes/admin.routes";
import { publicSubscriptionRouter } from "../features/subscriptions/routes/public.routes";
import { publicFolderRouter } from "../features/folders/routes/public.routes";
import { adminFolderRouter } from "../features/folders/routes/admin.routes";
import { publicFileRouter } from "../features/files/routes/public.routes";

const router = Router();

router.use("/auth", publicAuthRouter);
router.use("/packages", publicPackageRouter);
router.use("/admin/packages", adminPackageRouter);
router.use("/subscriptions", publicSubscriptionRouter);
router.use("/folders", publicFolderRouter);
router.use("/admin/folders", adminFolderRouter);
router.use("/files", publicFileRouter);

export default router;