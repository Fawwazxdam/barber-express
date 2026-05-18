// src/controllers/tenants.controller.ts
import { Request, Response } from "express";
import { TenantsService } from "../services/tenants.service";
import { verifyToken } from "../utils/jwt";

export const TenantsController = {
  async getAllTenants(req: Request, res: Response) {
    try {
      const data = await TenantsService.getAllTenants();
      return res.status(200).json({ status: 200, message: "Success fetch tenants", data });
    } catch (error: any) {
      console.error(error);
      const status = error.statusCode || 500;
      return res.status(status).json({ status, message: error.message || "Failed to fetch tenants", data: null });
    }
  },

  async getTenantById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const data = await TenantsService.getTenantById(id);
      return res.status(200).json({ status: 200, message: "Success fetch tenant", data });
    } catch (error: any) {
      console.error(error);
      const status = error.statusCode || 500;
      return res.status(status).json({ status, message: error.message || "Failed to fetch tenant", data: null });
    }
  },

  async getTenantBySlug(req: Request, res: Response) {
    try {
      const slug = req.params.slug as string;
      const data = await TenantsService.getTenantBySlug(slug);
      return res.status(200).json({ status: 200, message: "Success fetch tenant", data });
    } catch (error: any) {
      console.error(error);
      const status = error.statusCode || 500;
      return res.status(status).json({ status, message: error.message || "Failed to fetch tenant", data: null });
    }
  },

  async getCurrentTenant(req: Request, res: Response) {
    try {
      const token = req.cookies?.access_token;
      if (!token) {
        return res.status(401).json({ status: 401, message: "Unauthenticated", data: null });
      }
      const payload = verifyToken(token);
      if (!payload.tenantId) {
        return res.status(400).json({ status: 400, message: "User has no tenant", data: null });
      }

      const data = await TenantsService.getTenantByToken(payload.tenantId);
      return res.status(200).json({ status: 200, message: "Success fetch current tenant", data });
    } catch (error: any) {
      console.error(error);
      const status = error.statusCode || 500;
      return res.status(status).json({ status, message: error.message || "Failed to fetch current tenant", data: null });
    }
  },

  async createTenant(req: Request, res: Response) {
    try {
      const token = req.cookies?.access_token;
      if (!token) return res.status(401).json({ status: 401, message: "Unauthenticated", data: null });

      const payload = verifyToken(token);
      if (payload.role !== "ADMIN") return res.status(403).json({ status: 403, message: "Forbidden: Admin only", data: null });

      const dto = req.body;
      const data = await TenantsService.createTenant(dto);
      return res.status(201).json({ status: 201, message: "Tenant created successfully", data });
    } catch (error: any) {
      console.error(error);
      const status = error.statusCode || 500;
      return res.status(status).json({ status, message: error.message || "Failed to create tenant", data: null });
    }
  },

  async updateTenant(req: Request, res: Response) {
    try {
      const token = req.cookies?.access_token;
      if (!token) return res.status(401).json({ status: 401, message: "Unauthenticated", data: null });

      const payload = verifyToken(token);
      if (payload.role !== "ADMIN") return res.status(403).json({ status: 403, message: "Forbidden: Admin only", data: null });

      const id = req.params.id as string;
      const dto = req.body;
      const data = await TenantsService.updateTenant(id, dto);
      return res.status(200).json({ status: 200, message: "Tenant updated successfully", data });
    } catch (error: any) {
      console.error(error);
      const status = error.statusCode || 500;
      return res.status(status).json({ status, message: error.message || "Failed to update tenant", data: null });
    }
  },

  async deleteTenant(req: Request, res: Response) {
    try {
      const token = req.cookies?.access_token;
      if (!token) return res.status(401).json({ status: 401, message: "Unauthenticated", data: null });

      const payload = verifyToken(token);
      if (payload.role !== "ADMIN") return res.status(403).json({ status: 403, message: "Forbidden: Admin only", data: null });

      const id = req.params.id as string;
      await TenantsService.deleteTenant(id);

      // Delete tidak butuh me-return data
      return res.status(200).json({ status: 200, message: "Tenant deleted successfully", data: null });
    } catch (error: any) {
      console.error(error);
      const status = error.statusCode || 500;
      return res.status(status).json({ status, message: error.message || "Failed to delete tenant", data: null });
    }
  },

  async getTenantStats(req: Request, res: Response) {
    try {
      console.log("Received request for tenant stats with params:", req.params);
      const id = req.params.id as string;
      console.log("Fetching stats for tenant ID:", id);

      if (!id || id === 'undefined') {
        return res.status(400).json({ status: 400, message: "Invalid tenant ID", data: null });
      }

      const data = await TenantsService.getTenantStats(id);
      return res.status(200).json({ status: 200, message: "Success fetch tenant stats", data });
    } catch (error: any) {
      console.error(error);
      const status = error.statusCode || 500;
      return res.status(status).json({ status, message: error.message || "Failed to get tenant stats", data: null });
    }
  },

  async getDashboardStats(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const data = await TenantsService.getDashboardStats(id);
      return res.status(200).json({ status: 200, message: "Success fetch dashboard stats", data });
    } catch (error: any) {
      console.error(error);
      const status = error.statusCode || 500;
      return res.status(status).json({ status, message: error.message || "Failed to get dashboard stats", data: null });
    }
  }
};