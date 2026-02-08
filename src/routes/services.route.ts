// src/routes/services.route.ts
import { Router } from "express";
import { ServicesController } from "../controllers/services.controller";

export const servicesRouter = Router();

servicesRouter.post("/", ServicesController.create);
servicesRouter.get("/", ServicesController.findAll);
servicesRouter.patch("/:id", ServicesController.update);
servicesRouter.patch("/:id/toggle-active", ServicesController.toggleActive);
servicesRouter.delete("/:id", ServicesController.remove);
