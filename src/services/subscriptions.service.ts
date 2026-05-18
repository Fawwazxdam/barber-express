// src/services/subscriptions.service.ts
import { SubscriptionsRepository } from "../db/subscriptions.repository";
import { PlansRepository } from "../db/plans.repository";
import { TenantsRepository } from "../db/tenants.repository";
import { UsersRepository } from "../db/users.repository";
import { sql } from "drizzle-orm";

export const SubscriptionsService = {
  async getTenantSubscription(tenantId: string) {
    const subscription = await SubscriptionsRepository.findCurrentByTenantId(tenantId);
    if (!subscription) {
      return { status: 404, message: "No subscription found for this tenant" };
    }
    return { status: 200, data: subscription };
  },

  async getActiveSubscription(tenantId: string) {
    const subscription = await SubscriptionsRepository.findActiveByTenantId(tenantId);
    if (!subscription) {
      return { status: 404, message: "No active subscription found" };
    }
    return { status: 200, data: subscription };
  },

  async createSubscription(dto: {
    tenantId: string;
    planId: string;
    durationDays?: number;
  }) {
    // Validate tenant exists
    const tenant = await TenantsRepository.findById(dto.tenantId);
    if (!tenant) {
      return { status: 404, message: "Tenant not found" };
    }

    // Validate plan exists
    const plan = await PlansRepository.findById(dto.planId);
    if (!plan) {
      return { status: 404, message: "Plan not found" };
    }

    if (!plan.isActive) {
      return { status: 400, message: "Plan is not active" };
    }

    // Check for existing active subscription
    const existingActive = await SubscriptionsRepository.findActiveByTenantId(dto.tenantId);
    if (existingActive) {
      return { status: 409, message: "Tenant already has an active subscription" };
    }

    const durationDays = dto.durationDays || 30;
    const now = new Date();
    const startsAt = now;
    const endsAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const result = await SubscriptionsRepository.create({
      tenantId: dto.tenantId,
      planId: dto.planId,
      status: "active",
      startsAt,
      endsAt,
    });

    return {
      status: 201,
      data: result[0],
      message: "Subscription created successfully",
    };
  },

  async renewSubscription(tenantId: string, durationDays?: number) {
    const current = await SubscriptionsRepository.findCurrentByTenantId(tenantId);
    if (!current) {
      return { status: 404, message: "No subscription found for this tenant" };
    }

    const duration = durationDays || 30;
    const newEndDate = new Date(current.endsAt.getTime() + duration * 24 * 60 * 60 * 1000);

    const updated = await SubscriptionsRepository.extendSubscription(current.id, newEndDate);

    return {
      status: 200,
      data: updated[0],
      message: "Subscription renewed successfully",
    };
  },

  async cancelSubscription(subscriptionId: string) {
    const subscription = await SubscriptionsRepository.findById(subscriptionId);
    if (!subscription) {
      return { status: 404, message: "Subscription not found" };
    }

    if (subscription.status === "cancelled") {
      return { status: 400, message: "Subscription already cancelled" };
    }

    const updated = await SubscriptionsRepository.updateStatus(subscriptionId, "cancelled");

    return {
      status: 200,
      data: updated[0],
      message: "Subscription cancelled successfully",
    };
  },

  async upgradeDowngradeSubscription(tenantId: string, newPlanId: string) {
    const currentSubscription = await SubscriptionsRepository.findCurrentByTenantId(tenantId);
    if (!currentSubscription) {
      return { status: 404, message: "No active subscription found" };
    }

    const newPlan = await PlansRepository.findById(newPlanId);
    if (!newPlan) {
      return { status: 404, message: "Plan not found" };
    }

    if (!newPlan.isActive) {
      return { status: 400, message: "Selected plan is not active" };
    }

    // Cancel current subscription
    await SubscriptionsRepository.updateStatus(currentSubscription.id, "cancelled");

    // Create new subscription with remaining time
    const remainingDays = Math.max(
      0,
      Math.ceil((currentSubscription.endsAt.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000))
    );

    const result = await SubscriptionsRepository.create({
      tenantId,
      planId: newPlanId,
      status: "active",
      startsAt: new Date(),
      endsAt: new Date(new Date().getTime() + remainingDays * 24 * 60 * 60 * 1000),
    });

    return {
      status: 200,
      data: result[0],
      message: `Subscription ${currentSubscription.planName === newPlan.name ? 'renewed' : 'changed'} to ${newPlan.name}`,
    };
  },

  async getSubscriptionHistory(tenantId: string, limit = 20) {
    const subscriptions = await SubscriptionsRepository.findByTenantId(tenantId);
    return {
      status: 200,
      data: subscriptions.slice(0, limit),
    };
  },

  async validateSubscription(tenantId: string) {
    const active = await SubscriptionsRepository.findActiveByTenantId(tenantId);
    return {
      status: 200,
      data: {
        isValid: !!active,
        subscription: active || null,
      },
    };
  },

  async getExpiredSubscriptions() {
    const expired = await SubscriptionsRepository.getExpiredSubscriptions();
    // Mark as expired
    for (const sub of expired) {
      await SubscriptionsRepository.updateStatus(sub.id, "expired");
    }
    return { status: 200, data: expired };
  }
};
