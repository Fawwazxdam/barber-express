import { db } from "../db";
import { transactions, bookings } from "../db/schema";
import { eq, and, gte, lt, sql } from "drizzle-orm";

export type CreateTransactionDto = typeof transactions.$inferInsert;

export const TransactionsRepository = {
  create(data: CreateTransactionDto) {
    return db.insert(transactions).values(data).returning();
  },

  async findByBookingId(bookingId: string) {
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.bookingId, bookingId))
      .limit(1);
    return result[0];
  },

  updateStatus(
    id: string,
    status: "unpaid" | "paid" | "cancelled" | "refunded",
    paymentMethod?: "cash" | "qris" | "transfer" | "other"
  ) {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };
    
    if (status === "paid") {
      updateData.paidAt = new Date();
    }
    
    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;
    }

    return db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id))
      .returning();
  },

  async getRevenueByTenantToday(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await db
      .select({ total: sql<number>`SUM(${transactions.amount})` })
      .from(transactions)
      .where(
        and(
          eq(transactions.tenantId, tenantId),
          eq(transactions.status, "paid"),
          gte(transactions.createdAt, today),
          lt(transactions.createdAt, tomorrow)
        )
      );

    return Number(result[0]?.total || 0);
  },

  async getRevenueByBarberToday(barberId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await db
      .select({ total: sql<number>`SUM(${transactions.amount})` })
      .from(transactions)
      .innerJoin(bookings, eq(transactions.bookingId, bookings.id))
      .where(
        and(
          eq(bookings.barberId, barberId),
          eq(transactions.status, "paid"),
          gte(transactions.createdAt, today),
          lt(transactions.createdAt, tomorrow)
        )
      );

    return Number(result[0]?.total || 0);
  }
};
