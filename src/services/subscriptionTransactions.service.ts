import { SubscriptionTransactionsRepository, CreateSubscriptionTransactionDto } from "../db/subscriptionTransactions.repository";
import { SubscriptionsRepository } from "../db/subscriptions.repository";

export class SubscriptionTransactionsService {
  static async createTransaction(data: CreateSubscriptionTransactionDto) {
    const [transaction] = await SubscriptionTransactionsRepository.create(data);
    return transaction;
  }

  static async getTenantTransactions(tenantId: string) {
    return SubscriptionTransactionsRepository.findByTenantId(tenantId);
  }

  static async getAllTransactions() {
    return SubscriptionTransactionsRepository.findAll();
  }

  static async getTransactionById(id: string) {
    return SubscriptionTransactionsRepository.findById(id);
  }

  static async updateTransactionStatus(id: string, status: "pending" | "approved" | "rejected", notes?: string) {
    const transaction = await SubscriptionTransactionsRepository.findById(id);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    const [updatedTransaction] = await SubscriptionTransactionsRepository.updateStatus(id, status, notes);

    // If approved and the status just changed to approved, we extend or create the subscription
    if (status === "approved" && transaction.status !== "approved") {
      const activeSubscription = await SubscriptionsRepository.findCurrentByTenantId(transaction.tenantId);
      
      const now = new Date();
      let newEndsAt = new Date();
      
      if (activeSubscription && activeSubscription.endsAt > now) {
        // Extend existing subscription by 30 days
        newEndsAt = new Date(activeSubscription.endsAt.getTime() + 30 * 24 * 60 * 60 * 1000);
        await SubscriptionsRepository.extendSubscription(activeSubscription.id, newEndsAt);
      } else {
        // Create new subscription for 30 days
        newEndsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        await SubscriptionsRepository.create({
          tenantId: transaction.tenantId,
          planId: transaction.planId,
          status: "active",
          startsAt: now,
          endsAt: newEndsAt,
        });
      }
    }

    return updatedTransaction;
  }
}
