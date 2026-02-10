// src/db/schema.ts
import { pgEnum, pgTable, uuid, varchar, timestamp, integer, boolean, text, serial } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  price: integer("price").notNull(),
  duration: integer("duration").notNull(), // menit
  isActive: boolean("is_active").default(true),
});


export const roleEnum = pgEnum("role", ["ADMIN", "BARBER"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: roleEnum("role").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),

  barberId: uuid("barber_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),

  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "restrict" }),

  customerUserId: uuid("customer_user_id").references(() => users.id, {
    onDelete: "set null",
  }),

  customerName: varchar("customer_name", { length: 100 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull().default(""),
  customerNote: text("customer_note"),
  bookingDate: timestamp("booking_date", { withTimezone: true }).notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  token: varchar("token", { length: 64 }).unique().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Media table (polymorphic)
export const media = pgTable("media", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: varchar("url", { length: 500 }).notNull(),
  filename: varchar("filename", { length: 255 }),
  mimeType: varchar("mime_type", { length: 50 }),
  size: integer("size"),
  
  // Polymorphic fields
  type: varchar("type", { length: 50 }).notNull(), // 'barber', 'service', 'booking', dll
  referenceId: uuid("reference_id").notNull(), // ID dari entity terkait
  
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Media = typeof media.$inferSelect;
export type CreateMediaDto = typeof media.$inferInsert;
