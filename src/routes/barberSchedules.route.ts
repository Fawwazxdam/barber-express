import { Router } from "express";
import { BarberSchedulesController } from "../controllers/barberSchedules.controller";

export const barberSchedulesRouter = Router();

barberSchedulesRouter.get("/barbers/:barberId/schedule", BarberSchedulesController.getSchedule);
barberSchedulesRouter.put("/barbers/:barberId/schedule", BarberSchedulesController.updateSchedule);
