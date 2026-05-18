// src/controllers/subscriptions.controller.ts
import { Request, Response } from "express";
import { SubscriptionsService } from "../services/subscriptions.service";
import { verifyToken } from "../utils/jwt";

export const SubscriptionsController = {
  async getTenantSubscription(req: Request, res: Response) {
    try {
      const tenantId = req.params.tenantId as string;
      
      // Check authorization - only admin or tenant owner
      const token = req.cookies?.access_token;
      if (!token) {
        return res.status(401).json({ message: "Unauthenticated" });
      }
      const payload = verifyToken(token);
      
      // For now, allow any authenticated user (implement proper checks later)
      
      const result = await SubscriptionsService.getTenantSubscription(tenantId);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch subscription" });
    }
  },

  async getActiveSubscription(req: Request, res: Response) {
    try {
      const tenantId = req.params.tenantId as string;
      const result = await SubscriptionsService.getActiveSubscription(tenantId);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch active subscription" });
    }
  },

  async createSubscription(req: Request, res: Response) {
    try {
      // Admin only
      const token = req.cookies?.access_token;
      if (!token) {
        return res.status(401).json({ message: "Unauthenticated" });
      }
      const payload = verifyToken(token);
      if (payload.role !== "ADMIN") {
        return res.status(403).json({ message: "Forbidden: Admin only" });
      }

      const dto = req.body;
      const result = await SubscriptionsService.createSubscription(dto);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to create subscription" });
    }
  },

  async renewSubscription(req: Request, res: Response) {
    try {
      const tenantId = req.params.tenantId as string;
      const durationDays = req.body.durationDays;
      const result = await SubscriptionsService.renewSubscription(tenantId, durationDays);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to renew subscription" });
    }
  },

  async cancelSubscription(req: Request, res: Response) {
    try {
      const subscriptionId = req.params.id as string;
      const result = await SubscriptionsService.cancelSubscription(subscriptionId);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to cancel subscription" });
    }
  },

  async upgradeDowngradeSubscription(req: Request, res: Response) {
    try {
      const tenantId = req.params.tenantId as string;
      const { planId } = req.body;
      const result = await SubscriptionsService.upgradeDowngradeSubscription(tenantId, planId);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to change subscription plan" });
    }
  },

  async getHistory(req: Request, res: Response) {
    try {
      const tenantId = req.params.tenantId as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await SubscriptionsService.getSubscriptionHistory(tenantId, limit);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to get subscription history" });
    }
  },

  async validateSubscription(req: Request, res: Response) {
    try {
      const tenantId = req.params.tenantId as string;
      const result = await SubscriptionsService.validateSubscription(tenantId);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to validate subscription" });
    }
  },

  async getExpiredSubscriptions(req: Request, res: Response) {
    try {
      // Admin only
      const token = req.cookies?.access_token;
      if (!token) {
        return res.status(401).json({ message: "Unauthenticated" });
      }
      const payload = verifyToken(token);
      if (payload.role !== "ADMIN") {
        return res.status(403).json({ message: "Forbidden: Admin only" });
      }

      const result = await SubscriptionsService.getExpiredSubscriptions();
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to get expired subscriptions" });
    }
  }
};
