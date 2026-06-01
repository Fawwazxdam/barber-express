// src/controllers/services.controller.ts
import { Request, Response } from "express";
import { ServicesService } from "../services/services.service";
import { CreateServiceDto } from "../db/services.repository";
import { verifyToken } from "../utils/jwt";

export const ServicesController = {
  async create(req: Request, res: Response) {
    try {
      const dto: CreateServiceDto = req.body;
      
      const token = req.cookies?.access_token;
      if (token) {
        try {
          const payload = verifyToken(token);
          if (payload.role !== "SUPERADMIN" && payload.tenantId) {
            dto.tenantId = payload.tenantId;
          }
        } catch (err) {}
      }
      
      const data = await ServicesService.create(dto);
      return res.status(201).json({ status: 201, message: "Service created successfully", data });
    } catch (error: any) {
      console.error(error);
      const status = error.statusCode || 500;
      return res.status(status).json({ status, message: error.message || "Failed to create service", data: null });
    }
  },

  async findAll(req: Request, res: Response) {
    try {
      let tenantId = req.query.tenantId as string;
      
      if (!tenantId) {
        const token = req.cookies?.access_token;
        if (token) {
          try {
            const payload = verifyToken(token);
            if (payload.role !== "SUPERADMIN" && payload.tenantId) {
              tenantId = payload.tenantId;
            }
          } catch (err) {}
        }
      }

      const data = await ServicesService.findAll(tenantId);
      return res.status(200).json({ status: 200, message: "Success fetch services", data });
    } catch (error: any) {
      console.error(error);
      const status = error.statusCode || 500;
      return res.status(status).json({ status, message: error.message || "Failed to fetch services", data: null });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const dto = req.body;
      const data = await ServicesService.update(id, dto);
      return res.status(200).json({ status: 200, message: "Service updated successfully", data });
    } catch (error: any) {
      console.error(error);
      const status = error.statusCode || 500;
      return res.status(status).json({ status, message: error.message || "Failed to update service", data: null });
    }
  },

  async toggleActive(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const data = await ServicesService.toggleActive(id);
      return res.status(200).json({ status: 200, message: "Service status toggled successfully", data });
    } catch (error: any) {
      console.error(error);
      const status = error.statusCode || 500;
      return res.status(status).json({ status, message: error.message || "Failed to toggle active status", data: null });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await ServicesService.remove(id);
      return res.status(200).json({ status: 200, message: "Service deleted successfully", data: null });
    } catch (error: any) {
      console.error(error);
      const status = error.statusCode || 500;
      return res.status(status).json({ status, message: error.message || "Failed to delete service", data: null });
    }
  },
};