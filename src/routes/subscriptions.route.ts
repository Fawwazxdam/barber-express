// src/routes/subscriptions.route.ts
import { Router } from "express";
import { SubscriptionsController } from "../controllers/subscriptions.controller";

export const subscriptionsRouter = Router();

// Tenant-specific routes
subscriptionsRouter.get("/tenant/:tenantId", SubscriptionsController.getTenantSubscription);
subscriptionsRouter.get("/tenant/:tenantId/active", SubscriptionsController.getActiveSubscription);
subscriptionsRouter.get("/tenant/:tenantId/history", SubscriptionsController.getHistory);
subscriptionsRouter.get("/tenant/:tenantId/validate", SubscriptionsController.validateSubscription);
subscriptionsRouter.post("/tenant/:tenantId/renew", SubscriptionsController.renewSubscription);
subscriptionsRouter.post("/tenant/:tenantId/upgrade", SubscriptionsController.upgradeDowngradeSubscription);

// Admin routes
subscriptionsRouter.post("/", SubscriptionsController.createSubscription);
subscriptionsRouter.delete("/:id", SubscriptionsController.cancelSubscription);
subscriptionsRouter.get("/expired", SubscriptionsController.getExpiredSubscriptions);
