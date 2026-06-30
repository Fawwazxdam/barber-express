import { pgTable, uuid, varchar, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";

export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  price: integer("price").notNull(),
  maxBarbers: integer("max_barbers").notNull().default(1),
  features: json("features").$type<string[]>().default([]),
  isPopular: boolean("is_popular").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
