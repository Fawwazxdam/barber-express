import { pgTable, uuid, integer, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const barberSchedules = pgTable("barber_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  barberId: uuid("barber_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  startTime: varchar("start_time", { length: 5 }).notNull().default("09:00"), // Format "HH:MM"
  endTime: varchar("end_time", { length: 5 }).notNull().default("17:00"), // Format "HH:MM"
  isActive: boolean("is_active").notNull().default(true), // true = masuk, false = libur
  createdAt: timestamp("created_at").defaultNow(),
});

export type BarberSchedule = typeof barberSchedules.$inferSelect;
export type NewBarberSchedule = typeof barberSchedules.$inferInsert;
