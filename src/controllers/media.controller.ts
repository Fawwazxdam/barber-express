// src/controllers/media.controller.ts
import { Request, Response } from "express";
import { MediaService } from "../services/media.service";
import { verifyToken } from "../utils/jwt";

export const MediaController = {
  async uploadLanding(req: Request, res: Response) {
    try {
      const token = req.cookies?.access_token;
      if (!token) return res.status(401).json({ status: 401, message: "Unauthenticated", data: null });

      const payload = verifyToken(token);
      if (payload.role !== "ADMIN") return res.status(403).json({ status: 403, message: "Forbidden: Admin only", data: null });

      if (!payload.tenantId) return res.status(400).json({ status: 400, message: "User has no tenant", data: null });

      const { type } = req.body;
      if (!type) return res.status(400).json({ status: 400, message: "type is required", data: null });

      const result = await MediaService.uploadLandingImage(req.file!, type, payload.tenantId);
      return res.status(result.status).json(result);
    } catch (error: any) {
      console.error(error);
      const status = error.statusCode || 500;
      return res.status(status).json({ status, message: error.message || "Failed to upload image", data: null });
    }
  },
  async create(req: Request, res: Response) {
    try {
      const { url, filename, mimeType, size, type, referenceId } = req.body;

      const result = await MediaService.createMedia({
        url,
        filename,
        mimeType,
        size,
        type,
        referenceId,
      });

      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to create media" });
    }
  },

  async findById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await MediaService.getMediaById(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch media" });
    }
  },

  async findByReference(req: Request, res: Response) {
    try {
      const { type, referenceId } = req.query;

      if (!type || !referenceId) {
        return res.status(400).json({ message: "type and referenceId are required" });
      }

      const result = await MediaService.getMediaByReference(
        type as string,
        referenceId as string
      );

      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch media" });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await MediaService.deleteMedia(id);
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to delete media" });
    }
  },
};
