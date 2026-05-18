// src/routes/tenants.route.ts
import { Router } from "express";
import { TenantsController } from "../controllers/tenants.controller";

export const tenantsRouter = Router();

// Public routes
tenantsRouter.get("/", TenantsController.getAllTenants);
tenantsRouter.get("/current", TenantsController.getCurrentTenant);
tenantsRouter.get("/:id", TenantsController.getTenantById);
tenantsRouter.get("/slug/:slug", TenantsController.getTenantBySlug);
tenantsRouter.get("/:id/stats", TenantsController.getTenantStats);
tenantsRouter.get("/:id/dashboard", TenantsController.getDashboardStats);

// Admin routes
tenantsRouter.post("/", TenantsController.createTenant);
tenantsRouter.patch("/:id", TenantsController.updateTenant);
tenantsRouter.delete("/:id", TenantsController.deleteTenant);
