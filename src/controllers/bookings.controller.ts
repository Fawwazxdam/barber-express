// src/controllers/bookings.controller.ts
import { Request, Response } from "express";
import { BookingsService } from "../services/bookings.service";

export const BookingsController = {
  async create(req: Request, res: Response) {
    try {
      const {
        barberId,
        serviceId,
        customerUserId,
        customerName,
        customerPhone,
        customerNote,
        bookingTime,
        duration,
      } = req.body;

      const result = await BookingsService.createBooking({
        barberId,
        serviceId,
        customerUserId,
        customerName,
        customerPhone,
        customerNote,
        bookingTime,
        duration,
      });

      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to create booking" });
    }
  },

  async findAll(req: Request, res: Response) {
    try {
      const result = await BookingsService.getBookings();
      return res.json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch bookings" });
    }
  },

  async findById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const result = await BookingsService.getBookingById(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch booking" });
    }
  },

  async getBookingsByBarber(req: Request, res: Response) {
    try {
      const { barberId } = req.query;
      if (!barberId || typeof barberId !== "string") {
        return res.status(400).json({ message: "barberId is required" });
      }

      const result = await BookingsService.getBookingsByBarber(barberId);
      return res.json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch barber bookings" });
    }
  },

  async getBarberBookingsByDate(req: Request, res: Response) {
    try {
      const { date, barberId } = req.query;

      const result = await BookingsService.getBarberBookingsByDate(
        date as string,
        barberId as string
      );

      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch barber bookings by date" });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { status } = req.body;

      if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const result = await BookingsService.updateBookingStatus(id, status);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to update booking status" });
    }
  },

  async getAvailableSlots(req: Request, res: Response) {
    try {
      const { date, barberId } = req.query;

      const result = await BookingsService.getAvailableSlots(
        date as string,
        barberId as string
      );

      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch available slots" });
    }
  },
};
