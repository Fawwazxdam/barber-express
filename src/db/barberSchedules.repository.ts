import { db } from "../db";
import { barberSchedules } from "../db/schema";
import { and, eq } from "drizzle-orm";

export const BarberSchedulesRepository = {
  findByBarberId(barberId: string) {
    return db
      .select()
      .from(barberSchedules)
      .where(eq(barberSchedules.barberId, barberId))
      .orderBy(barberSchedules.dayOfWeek);
  },

  async findByBarberIdAndDay(barberId: string, dayOfWeek: number) {
    const result = await db
      .select()
      .from(barberSchedules)
      .where(
        and(
          eq(barberSchedules.barberId, barberId),
          eq(barberSchedules.dayOfWeek, dayOfWeek)
        )
      )
      .limit(1);
    return result[0];
  },

  async upsert(
    barberId: string,
    dayOfWeek: number,
    data: { startTime: string; endTime: string; isActive: boolean }
  ) {
    const existing = await this.findByBarberIdAndDay(barberId, dayOfWeek);
    if (existing) {
      return db
        .update(barberSchedules)
        .set({
          startTime: data.startTime,
          endTime: data.endTime,
          isActive: data.isActive,
        })
        .where(eq(barberSchedules.id, existing.id))
        .returning();
    } else {
      return db
        .insert(barberSchedules)
        .values({
          barberId,
          dayOfWeek,
          startTime: data.startTime,
          endTime: data.endTime,
          isActive: data.isActive,
        })
        .returning();
    }
  },
};
