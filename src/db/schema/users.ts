import { pgEnum, pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const roleEnum = pgEnum("role", ["ADMIN", "OWNER", "BARBER"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: roleEnum("role").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
