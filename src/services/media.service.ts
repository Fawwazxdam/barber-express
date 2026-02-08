// src/services/media.service.ts
import { MediaRepository } from "../db/media.repository";

export const MediaService = {
  async createMedia(dto: {
    url: string;
    filename?: string;
    mimeType?: string;
    size?: number;
    type: string;
    referenceId: string;
  }) {
    const result = await MediaRepository.create(dto);
    return { status: 201, data: result[0] };
  },

  async getMediaById(id: string) {
    const result = await MediaRepository.findById(id);
    if (!result) {
      return { status: 404, message: "Media not found" };
    }
    return { status: 200, data: result };
  },

  async getMediaByReference(type: string, referenceId: string) {
    const result = await MediaRepository.findByReference(type, referenceId);
    return { status: 200, data: result };
  },

  async deleteMedia(id: string) {
    const existing = await MediaRepository.findById(id);
    if (!existing) {
      return { status: 404, message: "Media not found" };
    }

    await MediaRepository.delete(id);
    return { status: 200, message: "Media deleted" };
  },

  async deleteMediaByReference(type: string, referenceId: string) {
    await MediaRepository.deleteByReference(type, referenceId);
    return { status: 200, message: "Media deleted" };
  },
};
