// src/routes/users.route.ts
import { Router } from "express";
import { UsersController } from "../controllers/users.controller";

export const usersRouter = Router();

usersRouter.post("/barbers", UsersController.createBarber);
usersRouter.get("/barbers", UsersController.getBarbers);
usersRouter.get("/barbers/:id", UsersController.findBarberById);
usersRouter.patch("/barbers/:id", UsersController.updateBarber);
