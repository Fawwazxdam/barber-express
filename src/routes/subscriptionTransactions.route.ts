import { Router } from "express";
import { SubscriptionTransactionsController } from "../controllers/subscriptionTransactions.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireSuperadmin } from "../middlewares/superadmin.middleware";

const router = Router();

// Routes for tenants (barbershops)
router.post("/", requireAuth, SubscriptionTransactionsController.createTransaction);
router.get("/my-transactions", requireAuth, SubscriptionTransactionsController.getTenantTransactions);

// Routes for superadmin
router.get("/all", requireAuth, requireSuperadmin, SubscriptionTransactionsController.getAllTransactions);
router.put("/:id/status", requireAuth, requireSuperadmin, SubscriptionTransactionsController.updateTransactionStatus);

export default router;
