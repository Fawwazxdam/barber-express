import { Request, Response } from "express";
import { SuperadminService } from "../services/superadmin.service";
import { TenantsRepository } from "../db/tenants.repository";

export class SuperadminController {
  static async getStats(req: Request, res: Response) {
    try {
      const stats = await SuperadminService.getDashboardStats();
      return res.status(200).json(stats);
    } catch (error: any) {
      console.error("Error getting superadmin stats:", error);
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async getTenants(req: Request, res: Response) {
    try {
      const tenants = await SuperadminService.getAllTenantsWithStatus();
      return res.status(200).json(tenants);
    } catch (error: any) {
      console.error("Error getting tenants:", error);
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async suspendTenant(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      
      // Update isActive to false
      const [updatedTenant] = await TenantsRepository.update(id, { isActive: false });
      
      if (!updatedTenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      return res.status(200).json({ message: "Tenant suspended successfully", tenant: updatedTenant });
    } catch (error: any) {
      console.error("Error suspending tenant:", error);
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async activateTenant(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      
      // Update isActive to true
      const [updatedTenant] = await TenantsRepository.update(id, { isActive: true });
      
      if (!updatedTenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      return res.status(200).json({ message: "Tenant activated successfully", tenant: updatedTenant });
    } catch (error: any) {
      console.error("Error activating tenant:", error);
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async createTenant(req: Request, res: Response) {
    try {
      const result = await SuperadminService.createTenantWithOwner(req.body);
      return res.status(201).json({ message: "Tenant created successfully", data: result });
    } catch (error: any) {
      console.error("Error creating tenant:", error);
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async updateTenant(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const updated = await SuperadminService.updateTenant(id, req.body);
      return res.status(200).json({ message: "Tenant updated successfully", tenant: updated });
    } catch (error: any) {
      console.error("Error updating tenant:", error);
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async deleteTenant(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await SuperadminService.deleteTenant(id);
      return res.status(200).json({ message: "Tenant deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting tenant:", error);
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }
}
