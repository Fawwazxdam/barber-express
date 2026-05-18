// src/controllers/plans.controller.ts
import { Request, Response } from "express";
import { PlansService } from "../services/plans.service";
import { verifyToken } from "../utils/jwt";

export const PlansController = {
  async getAllPlans(req: Request, res: Response) {
    try {
      const result = await PlansService.getAllPlans();
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch plans" });
    }
  },

  async getActivePlans(req: Request, res: Response) {
    try {
      const result = await PlansService.getActivePlans();
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch active plans" });
    }
  },

  async getPlanById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await PlansService.getPlanById(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch plan" });
    }
  },

  async getPlanByName(req: Request, res: Response) {
    try {
      const name = req.params.name as string;
      const result = await PlansService.getPlanByName(name);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch plan" });
    }
  },

  async createPlan(req: Request, res: Response) {
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
      const result = await PlansService.createPlan(dto);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to create plan" });
    }
  },

  async updatePlan(req: Request, res: Response) {
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

      const id = req.params.id as string;
      const dto = req.body;
      const result = await PlansService.updatePlan(id, dto);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to update plan" });
    }
  },

  async deletePlan(req: Request, res: Response) {
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

      const id = req.params.id as string;
      const result = await PlansService.deletePlan(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to delete plan" });
    }
  },

  async getPlanStats(req: Request, res: Response) {
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

      const result = await PlansService.getPlanStats();
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to get plan stats" });
    }
  }
};
