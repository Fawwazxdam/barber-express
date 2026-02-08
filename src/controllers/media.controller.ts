// src/controllers/media.controller.ts
import { Request, Response } from "express";
import { MediaService } from "../services/media.service";

export const MediaController = {
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
