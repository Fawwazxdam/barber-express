// src/services/users.service.ts
import bcrypt from "bcrypt";
import path from "path";
import { UsersRepository } from "../db/users.repository";
import { MediaRepository } from "../db/media.repository";
import { BarberSchedulesService } from "./barberSchedules.service";

export const UsersService = {
  async createBarber(dto: {
    email: string;
    name: string;
    password: string;
    description?: string;
    image?: Express.Multer.File;
    schedules?: any[];
    tenantId?: string;
  }) {
    const existing = await UsersRepository.findByEmail(dto.email);
    if (existing) {
      return { status: 409, message: "Email already exists" };
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const userResult = await UsersRepository.create({
      email: dto.email,
      name: dto.name,
      password: hashed,
      role: "BARBER",
      description: dto.description,
      tenantId: dto.tenantId,
    });

    if (!userResult[0]) {
      return { status: 500, message: "Failed to create barber" };
    }

    // Create media record if image is uploaded
    if (dto.image) {
      const imageUrl = `/uploads/${dto.image.filename}`;
      await MediaRepository.create({
        url: imageUrl,
        filename: dto.image.originalname,
        mimeType: dto.image.mimetype,
        size: dto.image.size,
        type: "barber",
        referenceId: userResult[0].id,
      });
    }

    if (dto.schedules && Array.isArray(dto.schedules) && dto.schedules.length > 0) {
      await BarberSchedulesService.updateBarberSchedule(userResult[0].id, dto.schedules);
    }

    return { status: 201, message: "Barber created" };
  },

  async getBarbers(tenantId?: string) {
    const barbers = await UsersRepository.findBarbers(tenantId);
    
    // Fetch media for each barber
    const barbersWithMedia = await Promise.all(
      barbers.map(async (barber: any) => {
        const mediaResult = await MediaRepository.findByReference("barber", barber.id);
        return { ...barber, media: mediaResult };
      })
    );
    
    return barbersWithMedia;
  },

  async getBarberById(id: string) {
    const barber = await UsersRepository.findBarberById(id);
    if (!barber) {
      return { status: 404, message: "Barber not found" };
    }
    
    // Fetch media for this barber
    const media = await MediaRepository.findByReference("barber", id);
    
    return { status: 200, data: { ...barber, media } };
  },

  async updateBarber(
    id: string,
    dto: { name?: string; password?: string; image?: Express.Multer.File }
  ) {
    const barber = await UsersRepository.findBarberById(id);
    if (!barber) {
      return { status: 404, message: "Barber not found" };
    }

    const updateData: { name?: string; password?: string } = {};

    if (dto.name) {
      updateData.name = dto.name;
    }

    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    await UsersRepository.update(id, updateData);

    // Handle image upload
    if (dto.image) {
      // Delete existing media
      await MediaRepository.deleteByReference("barber", id);

      // Create new media record
      const imageUrl = `/uploads/${dto.image.filename}`;
      await MediaRepository.create({
        url: imageUrl,
        filename: dto.image.originalname,
        mimeType: dto.image.mimetype,
        size: dto.image.size,
        type: "barber",
        referenceId: id,
      });
    }

    return { status: 200, message: "Barber updated" };
  },
};
