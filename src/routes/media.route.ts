// src/routes/media.route.ts
import { Router } from "express";
import { MediaController } from "../controllers/media.controller";
import { upload } from "../config/multer";

export const mediaRouter = Router();

mediaRouter.post("/upload-landing", upload.single("image"), MediaController.uploadLanding);
mediaRouter.post("/", MediaController.create);
mediaRouter.get("/", MediaController.findByReference);
mediaRouter.get("/:id", MediaController.findById);
mediaRouter.delete("/:id", MediaController.delete);
