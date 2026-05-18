// src/db/refreshTokens.repository.ts
import { db } from "../db";
import { refreshTokens } from "../db/schema";
import { eq, lt } from "drizzle-orm";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type RefreshToken = InferSelectModel<typeof refreshTokens>;
export type CreateRefreshTokenDto = InferInsertModel<typeof refreshTokens>;

export const RefreshTokensRepository = {
  async create(data: CreateRefreshTokenDto) {
    return db.insert(refreshTokens).values(data).returning();
  },

  async findByToken(token: string) {
    const result = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token))
      .limit(1);
    return result[0];
  },

  async findByUserId(userId: string) {
    return db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.userId, userId))
      .orderBy(refreshTokens.createdAt);
  },

  async deleteByToken(token: string) {
    return db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  },

  async deleteByUserId(userId: string) {
    return db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  },

  async deleteExpired() {
    const now = new Date();
    return db.delete(refreshTokens).where(lt(refreshTokens.expiresAt, now));
  },

  async cleanupUserTokens(userId: string) {
    return db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }
};
