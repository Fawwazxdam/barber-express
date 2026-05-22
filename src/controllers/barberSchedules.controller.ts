import { Request, Response } from "express";
import { BarberSchedulesService } from "../services/barberSchedules.service";
import { verifyToken } from "../utils/jwt";

export const BarberSchedulesController = {
  async getSchedule(req: Request, res: Response) {
    try {
      const barberId = req.params.barberId as string;
      const result = await BarberSchedulesService.getBarberSchedule(barberId);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to get barber schedule" });
    }
  },

  async updateSchedule(req: Request, res: Response) {
    try {
      const token = req.cookies?.access_token;
      if (!token) {
        return res.status(401).json({ message: "Unauthenticated" });
      }

      const payload = verifyToken(token);
      const barberId = req.params.barberId as string;

      // Izinkan ADMIN, atau BARBER yang bersangkutan (mengedit jadwalnya sendiri)
      if (payload.role !== "ADMIN" && (payload.role !== "BARBER" || payload.id !== barberId)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { schedules } = req.body;
      if (!Array.isArray(schedules)) {
        return res.status(400).json({ message: "Schedules must be an array" });
      }

      const result = await BarberSchedulesService.updateBarberSchedule(barberId, schedules);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to update barber schedule" });
    }
  },
};
