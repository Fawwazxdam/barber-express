import { Router } from "express";
import { OnboardingController } from "../controllers/onboarding.controller";

const router = Router();

router.post("/tenant/register", OnboardingController.registerTenant);
router.post("/verify-email", OnboardingController.verifyEmail);

export default router;