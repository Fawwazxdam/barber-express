import { pgTable, uuid, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  isActive: boolean("is_active").default(true),
  openTime: varchar("open_time", { length: 5 }).default("09:00"), // Format HH:mm
  closeTime: varchar("close_time", { length: 5 }).default("21:00"), // Format HH:mm
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});
