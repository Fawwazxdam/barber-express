// src/db/media.repository.ts
import { db } from "../db";
import { media } from "../db/schema";
import { eq, and } from "drizzle-orm";

export type Media = typeof media.$inferSelect;
export type CreateMediaDto = typeof media.$inferInsert;

export const MediaRepository = {
  create(data: CreateMediaDto) {
    return db.insert(media).values(data).returning();
  },

  async findById(id: string) {
    const result = await db
      .select()
      .from(media)
      .where(eq(media.id, id))
      .limit(1);
    return result[0];
  },

  async findByReference(type: string, referenceId: string) {
    return db
      .select()
      .from(media)
      .where(and(eq(media.type, type), eq(media.referenceId, referenceId)))
      .orderBy(media.createdAt);
  },

  async delete(id: string) {
    return db.delete(media).where(eq(media.id, id)).returning();
  },

  async deleteByReference(type: string, referenceId: string) {
    return db
      .delete(media)
      .where(and(eq(media.type, type), eq(media.referenceId, referenceId)))
      .returning();
  },
};
