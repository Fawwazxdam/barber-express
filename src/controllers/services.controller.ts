// src/controllers/services.controller.ts
import { Request, Response } from "express";
import { ServicesRepository } from "../db/services.repository";
import { CreateServiceDto } from "../db/services.repository";

export const ServicesController = {
  async create(req: Request, res: Response) {
    try {
      const dto: CreateServiceDto = req.body;
      const result = await ServicesRepository.create(dto);
      return res.status(201).json(result[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to create service" });
    }
  },

  async findAll(req: Request, res: Response) {
    try {
      const result = await ServicesRepository.findAll();
      return res.json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch services" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const dto = req.body;

      const existing = await ServicesRepository.findById(id);
      if (!existing.length) {
        return res.status(404).json({ message: "Service tidak ditemukan" });
      }

      const result = await ServicesRepository.update(id, dto);
      return res.json(result[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to update service" });
    }
  },

  async toggleActive(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const existing = await ServicesRepository.findById(id);
      if (!existing.length) {
        return res.status(404).json({ message: "Service tidak ditemukan" });
      }

      const service = existing[0]!;
      const result = await ServicesRepository.update(id, {
        isActive: !service.isActive,
      });
      return res.json(result[0]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to toggle active" });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const existing = await ServicesRepository.findById(id);
      if (!existing.length) {
        return res.status(404).json({ message: "Service tidak ditemukan" });
      }

      await ServicesRepository.delete(id);
      return res.json({ message: "Service deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to delete service" });
    }
  },
};
