import { pgEnum, pgTable, uuid, integer, timestamp, varchar, text } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { plans } from "./plans";
import { subscriptions } from "./subscriptions";

export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "approved", "rejected"]);

export const subscriptionTransactions = pgTable("subscription_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  planId: uuid("plan_id").notNull().references(() => plans.id, { onDelete: "restrict" }),
  // Nullable because it might be a new subscription that hasn't been created yet, or it links to an existing one
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id, { onDelete: "set null" }),
  amount: integer("amount").notNull(),
  status: transactionStatusEnum("status").notNull().default("pending"),
  paymentProofUrl: varchar("payment_proof_url", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
