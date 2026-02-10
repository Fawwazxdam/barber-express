// src/routes/bookings.route.ts
import { Router } from "express";
import { BookingsController } from "../controllers/bookings.controller";

export const bookingsRouter = Router();

bookingsRouter.post("/", BookingsController.create);
bookingsRouter.get("/", BookingsController.findAll);

// Specific routes first (before :id)
bookingsRouter.get("/available-slots", BookingsController.getAvailableSlots);
bookingsRouter.get("/by-barber", BookingsController.getBookingsByBarber);
bookingsRouter.get("/barber", BookingsController.getBarberBookingsByDate);
bookingsRouter.get("/dashboard/stats", BookingsController.getDashboardStats);
bookingsRouter.get("/barber/dashboard/stats", BookingsController.getBarberDashboardStats);

// Dynamic routes last
bookingsRouter.get("/:id", BookingsController.findById);
bookingsRouter.patch("/:id/status", BookingsController.updateStatus);
