import { BarberSchedulesRepository } from "../db/barberSchedules.repository";
import { UsersRepository } from "../db/users.repository";

export const BarberSchedulesService = {
  async getBarberSchedule(barberId: string) {
    const barber = await UsersRepository.findBarberById(barberId);
    if (!barber) {
      return { status: 404, message: "Barber not found" };
    }

    const schedule = await BarberSchedulesRepository.findByBarberId(barberId);
    return { status: 200, data: schedule };
  },

  async updateBarberSchedule(
    barberId: string,
    schedules: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[]
  ) {
    const barber = await UsersRepository.findBarberById(barberId);
    if (!barber) {
      return { status: 404, message: "Barber not found" };
    }

    // Validasi input jadwal
    for (const item of schedules) {
      if (item.dayOfWeek < 0 || item.dayOfWeek > 6) {
        return { status: 400, message: "Invalid day of week. Must be 0-6." };
      }
      
      const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
      if (!timePattern.test(item.startTime) || !timePattern.test(item.endTime)) {
        return { status: 400, message: "Invalid time format. Must be HH:MM." };
      }
    }

    const results = [];
    for (const item of schedules) {
      const res = await BarberSchedulesRepository.upsert(barberId, item.dayOfWeek, {
        startTime: item.startTime,
        endTime: item.endTime,
        isActive: item.isActive,
      });
      results.push(res[0]);
    }

    return { status: 200, data: results, message: "Schedule updated successfully" };
  },
};
