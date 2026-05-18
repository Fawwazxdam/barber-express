import { pgEnum, pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";
import { services } from "./services";

export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "cancelled", "completed"]);

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  barberId: uuid("barber_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  serviceId: uuid("service_id").notNull().references(() => services.id, { onDelete: "restrict" }),
  customerUserId: uuid("customer_user_id").references(() => users.id, { onDelete: "set null" }),
  customerName: varchar("customer_name", { length: 100 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull().default(""),
  customerNote: text("customer_note"),
  bookingDate: timestamp("booking_date", { withTimezone: true }).notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});
