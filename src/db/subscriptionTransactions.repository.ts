import { db } from "../db";
import { subscriptionTransactions } from "../db/schema/subscriptionTransactions";
import { eq, sql } from "drizzle-orm";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type SubscriptionTransaction = InferSelectModel<typeof subscriptionTransactions>;
export type CreateSubscriptionTransactionDto = InferInsertModel<typeof subscriptionTransactions>;

export const SubscriptionTransactionsRepository = {
  async findAll() {
    return db
      .select()
      .from(subscriptionTransactions)
      .orderBy(sql`${subscriptionTransactions.createdAt} DESC`);
  },

  async findByTenantId(tenantId: string) {
    return db
      .select()
      .from(subscriptionTransactions)
      .where(eq(subscriptionTransactions.tenantId, tenantId))
      .orderBy(sql`${subscriptionTransactions.createdAt} DESC`);
  },

  async findById(id: string) {
    const result = await db
      .select()
      .from(subscriptionTransactions)
      .where(eq(subscriptionTransactions.id, id))
      .limit(1);
    return result[0];
  },

  async create(data: CreateSubscriptionTransactionDto) {
    return db.insert(subscriptionTransactions).values(data).returning();
  },

  async updateStatus(id: string, status: "pending" | "approved" | "rejected", notes?: string) {
    const updateData: any = { status, updatedAt: new Date() };
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    return db
      .update(subscriptionTransactions)
      .set(updateData)
      .where(eq(subscriptionTransactions.id, id))
      .returning();
  },
};
