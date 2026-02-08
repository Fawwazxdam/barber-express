// src/routes/media.route.ts
import { Router } from "express";
import { MediaController } from "../controllers/media.controller";

export const mediaRouter = Router();

mediaRouter.post("/", MediaController.create);
mediaRouter.get("/", MediaController.findByReference);
mediaRouter.get("/:id", MediaController.findById);
mediaRouter.delete("/:id", MediaController.delete);
