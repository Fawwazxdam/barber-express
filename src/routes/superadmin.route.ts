import { Router } from "express";
import { SuperadminController } from "../controllers/superadmin.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireSuperadmin } from "../middlewares/superadmin.middleware";

const router = Router();

// Protect all superadmin routes
router.use(requireAuth);
router.use(requireSuperadmin);

router.get("/stats", SuperadminController.getStats);
router.get("/tenants", SuperadminController.getTenants);
router.post("/tenants", SuperadminController.createTenant);
router.patch("/tenants/:id", SuperadminController.updateTenant);
router.delete("/tenants/:id", SuperadminController.deleteTenant);
router.put("/tenants/:id/suspend", SuperadminController.suspendTenant);
router.put("/tenants/:id/activate", SuperadminController.activateTenant);

export default router;
