// src/routes/plans.route.ts
import { Router } from "express";
import { PlansController } from "../controllers/plans.controller";

export const plansRouter = Router();

// Public routes
plansRouter.get("/", PlansController.getAllPlans);
plansRouter.get("/active", PlansController.getActivePlans);
plansRouter.get("/:id", PlansController.getPlanById);
plansRouter.get("/name/:name", PlansController.getPlanByName);
plansRouter.get("/:id/stats", PlansController.getPlanStats);

// Admin routes
plansRouter.post("/", PlansController.createPlan);
plansRouter.patch("/:id", PlansController.updatePlan);
plansRouter.delete("/:id", PlansController.deletePlan);
