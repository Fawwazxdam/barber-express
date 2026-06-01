import { pgEnum, pgTable, uuid, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { bookings } from "./bookings";

export const bookingTransactionStatusEnum = pgEnum("booking_transaction_status", ["unpaid", "paid", "cancelled", "refunded"]);
export const paymentMethodEnum = pgEnum("payment_method", ["cash", "qris", "transfer", "other"]);

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }), // Can be null if it's purely a retail transaction
  amount: integer("amount").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").default("cash"),
  status: bookingTransactionStatusEnum("status").notNull().default("unpaid"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});
