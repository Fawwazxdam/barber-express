// src/services/users.service.ts
import bcrypt from "bcrypt";
import { UsersRepository } from "../db/users.repository";

export const UsersService = {
  async createBarber(dto: { email: string; name: string; password: string }) {
    const existing = await UsersRepository.findByEmail(dto.email);
    if (existing) {
      return { status: 409, message: "Email already exists" };
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    await UsersRepository.create({
      email: dto.email,
      name: dto.name,
      password: hashed,
      role: "BARBER",
    });

    return { status: 201, message: "Barber created" };
  },

  async getBarbers() {
    return UsersRepository.findBarbers();
  },

  async getBarberById(id: string) {
    const barber = await UsersRepository.findBarberById(id);
    if (!barber) {
      return { status: 404, message: "Barber not found" };
    }
    return { status: 200, data: barber };
  },

  async updateBarber(id: string, dto: { name?: string; password?: string }) {
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

    return { status: 200, message: "Barber updated" };
  },
};
