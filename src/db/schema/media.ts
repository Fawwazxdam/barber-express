import { pgTable, uuid, varchar, integer, timestamp } from "drizzle-orm/pg-core";

export const media = pgTable("media", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: varchar("url", { length: 500 }).notNull(),
  filename: varchar("filename", { length: 255 }),
  mimeType: varchar("mime_type", { length: 50 }),
  size: integer("size"),
  type: varchar("type", { length: 50 }).notNull(),
  referenceId: uuid("reference_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Media = typeof media.$inferSelect;
export type CreateMediaDto = typeof media.$inferInsert;
