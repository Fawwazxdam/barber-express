// src/services/services.service.ts
import { ServicesRepository, CreateServiceDto } from "../db/services.repository";

export class AppError extends Error {
    constructor(public message: string, public statusCode: number) {
        super(message);
        this.name = "AppError";
    }
}

export const ServicesService = {
    async create(dto: CreateServiceDto) {
        const result = await ServicesRepository.create(dto);
        return result[0];
    },

    async findAll() {
        return await ServicesRepository.findAll();
    },

    async findById(id: string) {
        const existing = await ServicesRepository.findById(id);
        if (!existing.length) {
            throw new AppError("Service tidak ditemukan", 404);
        }
        return existing[0];
    },

    async update(id: string, dto: Partial<CreateServiceDto>) {
        // Validasi keberadaan data
        const existing = await ServicesRepository.findById(id);
        if (!existing.length) {
            throw new AppError("Service tidak ditemukan", 404);
        }

        const result = await ServicesRepository.update(id, dto);
        return result[0];
    },

    async toggleActive(id: string) {
        // Validasi keberadaan data
        const existing = await ServicesRepository.findById(id);
        if (!existing.length) {
            throw new AppError("Service tidak ditemukan", 404);
        }

        const service = existing[0]!;
        const result = await ServicesRepository.update(id, {
            isActive: !service.isActive,
        });
        return result[0];
    },

    async remove(id: string) {
        // Validasi keberadaan data
        const existing = await ServicesRepository.findById(id);
        if (!existing.length) {
            throw new AppError("Service tidak ditemukan", 404);
        }

        await ServicesRepository.delete(id);
        return true;
    },
};