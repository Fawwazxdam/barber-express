// src/db/plans.repository.ts
import { db } from "../db";
import { plans } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type Plan = InferSelectModel<typeof plans>;
export type CreatePlanDto = InferInsertModel<typeof plans>;
export type UpdatePlanDto = Partial<CreatePlanDto>;

export const PlansRepository = {
  async findAll() {
    return db.select().from(plans).orderBy(plans.price);
  },

  async findActivePlans() {
    return db
      .select()
      .from(plans)
      .where(eq(plans.isActive, true))
      .orderBy(plans.price);
  },

  async findById(id: string) {
    const result = await db
      .select()
      .from(plans)
      .where(eq(plans.id, id))
      .limit(1);
    return result[0];
  },

  async findByIdentifier(identifier: string) {
    // Try to find by ID first, then by name
    const byId = await this.findById(identifier);
    if (byId) return byId;

    const byName = await db
      .select()
      .from(plans)
      .where(eq(plans.name, identifier))
      .limit(1);
    return byName[0];
  },

  async create(data: CreatePlanDto) {
    return db.insert(plans).values(data).returning();
  },

  async update(id: string, data: UpdatePlanDto) {
    return db
      .update(plans)
      .set(data)
      .where(eq(plans.id, id))
      .returning();
  },

  async delete(id: string) {
    return db.delete(plans).where(eq(plans.id, id));
  },

  async countActive() {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(plans)
      .where(eq(plans.isActive, true));
    return Number(result[0]?.count || 0);
  }
};
