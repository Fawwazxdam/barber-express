// src/db/bookings.repository.ts
import { db } from "../db";
import { bookings, services, users } from "../db/schema";
import { and, lt, gt, gte, eq, sql, inArray } from "drizzle-orm";

export type Booking = typeof bookings.$inferSelect;
export type CreateBookingDto = typeof bookings.$inferInsert;

export const BookingsRepository = {
  create(data: CreateBookingDto) {
    return db.insert(bookings).values(data).returning();
  },

  findAll() {
    return db.select().from(bookings);
  },

  async findById(id: string) {
    // Check if it's a full UUID or partial (8 characters)
    const isPartial = id.length < 36;

    let result;
    if (isPartial) {
      // Search by first characters (partial match)
      result = await db
        .select({
          id: bookings.id,
          customerName: bookings.customerName,
          customerPhone: bookings.customerPhone,
          serviceName: services.name,
          servicePrice: services.price,
          barberName: users.name,
          bookingDate: bookings.bookingDate,
          duration: services.duration,
          status: bookings.status,
          createdAt: bookings.createdAt,
        })
        .from(bookings)
        .innerJoin(services, eq(bookings.serviceId, services.id))
        .innerJoin(users, eq(bookings.barberId, users.id))
        .where(sql`${bookings.id}::text LIKE ${id + "%"}`)
        .limit(1);
    } else {
      // Full UUID match
      result = await db
        .select({
          id: bookings.id,
          customerName: bookings.customerName,
          customerPhone: bookings.customerPhone,
          serviceName: services.name,
          servicePrice: services.price,
          barberName: users.name,
          bookingDate: bookings.bookingDate,
          duration: services.duration,
          status: bookings.status,
          createdAt: bookings.createdAt,
        })
        .from(bookings)
        .innerJoin(services, eq(bookings.serviceId, services.id))
        .innerJoin(users, eq(bookings.barberId, users.id))
        .where(eq(bookings.id, id))
        .limit(1);
    }

    return result[0];
  },

  async isTimeSlotAvailable(barberId: string, start: Date, end: Date) {
    const result = await db
      .select()
      .from(bookings)
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .where(
        and(
          eq(bookings.barberId, barberId),
          inArray(bookings.status, ["pending", "confirmed"]),
          lt(bookings.bookingDate, end),
          sql`${bookings.bookingDate} + interval '1 minute' * ${services.duration} > ${start}`
        )
      );

    return result.length === 0;
  },

  async findBookingsByDate(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return db
      .select({
        id: bookings.id,
        barberId: bookings.barberId,
        serviceId: bookings.serviceId,
        customerUserId: bookings.customerUserId,
        customerName: bookings.customerName,
        customerPhone: bookings.customerPhone,
        customerNote: bookings.customerNote,
        bookingDate: bookings.bookingDate,
        status: bookings.status,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        duration: services.duration,
      })
      .from(bookings)
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .where(
        and(
          gte(bookings.bookingDate, startOfDay),
          lt(bookings.bookingDate, endOfDay)
        )
      );
  },

  async findBookingsByBarber(barberId: string) {
    return db
      .select({
        id: bookings.id,
        barberId: bookings.barberId,
        serviceId: bookings.serviceId,
        customerUserId: bookings.customerUserId,
        customerName: bookings.customerName,
        customerPhone: bookings.customerPhone,
        customerNote: bookings.customerNote,
        bookingDate: bookings.bookingDate,
        status: bookings.status,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        duration: services.duration,
      })
      .from(bookings)
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.barberId, barberId));
  },

  async findBookingsByBarberAndDate(barberId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return db
      .select({
        id: bookings.id,
        barberId: bookings.barberId,
        serviceId: bookings.serviceId,
        serviceName: services.name,
        customerUserId: bookings.customerUserId,
        customerName: bookings.customerName,
        customerPhone: bookings.customerPhone,
        customerNote: bookings.customerNote,
        bookingDate: bookings.bookingDate,
        status: bookings.status,
        duration: services.duration,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
      })
      .from(bookings)
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .where(
        and(
          eq(bookings.barberId, barberId),
          gte(bookings.bookingDate, startOfDay),
          lt(bookings.bookingDate, endOfDay)
        )
      )
      .orderBy(bookings.bookingDate);
  },

  updateStatus(
    bookingId: string,
    status: "pending" | "confirmed" | "completed" | "cancelled"
  ) {
    return db
      .update(bookings)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();
  },
};
