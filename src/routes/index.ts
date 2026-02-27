import { Router } from "express";
import { publicAuthRouter } from "../features/auth/routes/public.routes";
import { publicPackageRouter } from "../features/packages/routes/public.routes";
import { adminPackageRouter } from "../features/packages/routes/admin.routes";

const router = Router();

router.use("/auth", publicAuthRouter);
router.use("/packages", publicPackageRouter);
router.use("/admin/packages", adminPackageRouter);

export default router;