// src/routes/users.route.ts
import { Router } from "express";
import { UsersController } from "../controllers/users.controller";
import { upload } from "../config/multer";

export const usersRouter = Router();

// Multer middleware for file uploads
const uploadSingle = upload.single("image");

// Wrap handler to handle multer errors
const handleUpload = (handler: (req: any, res: any) => Promise<any>) => {
  return (req: any, res: any) => {
    uploadSingle(req, res, (err: any) => {
      if (err instanceof Error) {
        console.error("Multer error:", err.message);
        return res.status(400).json({ message: err.message });
      }
      console.log("File uploaded:", req.file);
      console.log("Body:", req.body);
      console.log("Headers:", req.headers["content-type"]);
      handler(req, res);
    });
  };
};

usersRouter.post("/barbers", handleUpload(UsersController.createBarber));
usersRouter.get("/barbers", UsersController.getBarbers);
usersRouter.get("/barbers/:id", UsersController.findBarberById);
usersRouter.patch("/barbers/:id", handleUpload(UsersController.updateBarber));
