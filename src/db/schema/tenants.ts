import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  isActive: boolean("is_active").default(true),
  openTime: varchar("open_time", { length: 5 }).default("09:00"),
  closeTime: varchar("close_time", { length: 5 }).default("21:00"),
  heroImage: text("hero_image"),
  heroTitle: text("hero_title"),
  heroDescription: text("hero_description"),
  tagline: text("tagline"),
  aboutText: text("about_text"),
  galleryImages: jsonb("gallery_images").$type<string[]>(),
  ctaTitle: text("cta_title"),
  ctaDescription: text("cta_description"),
  ctaButtonText: text("cta_button_text"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});
