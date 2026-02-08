// src/controllers/users.controller.ts
import { Request, Response } from "express";
import { UsersService } from "../services/users.service";
import { verifyToken } from "../utils/jwt";

export const UsersController = {
  async createBarber(req: Request, res: Response) {
    try {
      // Check authentication
      const token = req.cookies?.access_token;
      if (!token) {
        return res.status(401).json({ message: "Unauthenticated" });
      }

      const payload = verifyToken(token);
      if (payload.role !== "ADMIN") {
        return res.status(403).json({ message: "Forbidden: Admin only" });
      }

      const { email, name, password } = req.body;
      const result = await UsersService.createBarber({ email, name, password });

      return res.status(result.status).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to create barber" });
    }
  },

  async getBarbers(req: Request, res: Response) {
    try {
      const result = await UsersService.getBarbers();
      return res.json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch barbers" });
    }
  },

  async findBarberById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await UsersService.getBarberById(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch barber" });
    }
  },

  async updateBarber(req: Request, res: Response) {
    try {
      // Check authentication
      const token = req.cookies?.access_token;
      if (!token) {
        return res.status(401).json({ message: "Unauthenticated" });
      }

      const payload = verifyToken(token);
      if (payload.role !== "ADMIN") {
        return res.status(403).json({ message: "Forbidden: Admin only" });
      }

      const id = req.params.id as string;
      const { name, password } = req.body;

      const result = await UsersService.updateBarber(id, { name, password });

      return res.status(result.status).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to update barber" });
    }
  },
};
