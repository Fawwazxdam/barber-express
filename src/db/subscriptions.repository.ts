// src/db/subscriptions.repository.ts
import { db } from "../db";
import { subscriptions, subscriptionStatusEnum, tenants, plans } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type Subscription = InferSelectModel<typeof subscriptions>;
export type CreateSubscriptionDto = InferInsertModel<typeof subscriptions>;

export const SubscriptionsRepository = {
  async findByTenantId(tenantId: string) {
    return db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .orderBy(sql`${subscriptions.createdAt} DESC`);
  },

  async findActiveByTenantId(tenantId: string) {
    const now = new Date();
    const result = await db
      .select({
        id: subscriptions.id,
        tenantId: subscriptions.tenantId,
        planId: subscriptions.planId,
        status: subscriptions.status,
        startsAt: subscriptions.startsAt,
        endsAt: subscriptions.endsAt,
        createdAt: subscriptions.createdAt,
        planName: plans.name,
        planPrice: plans.price,
        planMaxBarbers: plans.maxBarbers,
      })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.planId, plans.id))
      .where(
        and(
          eq(subscriptions.tenantId, tenantId),
          eq(subscriptions.status, "active"),
          sql`${subscriptions.startsAt} <= ${now}`,
          sql`${subscriptions.endsAt} >= ${now}`
        )
      )
      .limit(1);
    return result[0];
  },

  async findCurrentByTenantId(tenantId: string) {
    const result = await db
      .select({
        id: subscriptions.id,
        tenantId: subscriptions.tenantId,
        planId: subscriptions.planId,
        status: subscriptions.status,
        startsAt: subscriptions.startsAt,
        endsAt: subscriptions.endsAt,
        createdAt: subscriptions.createdAt,
        planName: plans.name,
        planPrice: plans.price,
        planMaxBarbers: plans.maxBarbers,
      })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.planId, plans.id))
      .where(eq(subscriptions.tenantId, tenantId))
      .orderBy(sql`${subscriptions.createdAt} DESC`)
      .limit(1);
    return result[0];
  },

  async findById(id: string) {
    const result = await db
      .select({
        id: subscriptions.id,
        tenantId: subscriptions.tenantId,
        planId: subscriptions.planId,
        status: subscriptions.status,
        startsAt: subscriptions.startsAt,
        endsAt: subscriptions.endsAt,
        createdAt: subscriptions.createdAt,
        planName: plans.name,
        planPrice: plans.price,
        planMaxBarbers: plans.maxBarbers,
      })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.planId, plans.id))
      .where(eq(subscriptions.id, id))
      .limit(1);
    return result[0];
  },

  async create(data: CreateSubscriptionDto) {
    return db.insert(subscriptions).values(data).returning();
  },

  async updateStatus(id: string, status: "active" | "expired" | "cancelled") {
    return db
      .update(subscriptions)
      .set({ status })
      .where(eq(subscriptions.id, id))
      .returning();
  },

  async extendSubscription(id: string, newEndDate: Date) {
    return db
      .update(subscriptions)
      .set({ endsAt: newEndDate })
      .where(eq(subscriptions.id, id))
      .returning();
  },

  async getExpiredSubscriptions() {
    const now = new Date();
    return db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, "active"),
          sql`${subscriptions.endsAt} < ${now}`
        )
      );
  },

  async countActiveByTenant(tenantId: string) {
    const now = new Date();
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.tenantId, tenantId),
          eq(subscriptions.status, "active"),
          sql`${subscriptions.startsAt} <= ${now}`,
          sql`${subscriptions.endsAt} >= ${now}`
        )
      );
    return Number(result[0]?.count || 0);
  },

  async countActiveByPlan(planId: string) {
    const now = new Date();
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.planId, planId),
          eq(subscriptions.status, "active"),
          sql`${subscriptions.startsAt} <= ${now}`,
          sql`${subscriptions.endsAt} >= ${now}`
        )
      );
    return Number(result[0]?.count || 0);
  },

  async countByPlan(planId: string) {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.planId, planId));
    return Number(result[0]?.count || 0);
  },
};
