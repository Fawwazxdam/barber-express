// src/routes/auth.route.ts
import { Router } from "express";
import { login, logout, logoutAll, refresh, me, changePassword } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/logout-all", requireAuth, logoutAll);
router.post("/refresh", refresh);
router.get("/me", requireAuth, me);
router.post("/change-password", requireAuth, changePassword);

export default router;
