// src/services/plans.service.ts
import { PlansRepository } from "../db/plans.repository";
import { SubscriptionsRepository } from "../db/subscriptions.repository";

export const PlansService = {
  async getAllPlans() {
    const plans = await PlansRepository.findAll();
    return { status: 200, data: plans };
  },

  async getActivePlans() {
    const plans = await PlansRepository.findActivePlans();
    return { status: 200, data: plans };
  },

  async getPlanById(id: string) {
    const plan = await PlansRepository.findById(id);
    if (!plan) {
      return { status: 404, message: "Plan not found" };
    }
    return { status: 200, data: plan };
  },

  async getPlanByName(name: string) {
    const plan = await PlansRepository.findByIdentifier(name);
    if (!plan) {
      return { status: 404, message: "Plan not found" };
    }
    return { status: 200, data: plan };
  },

  async createPlan(dto: {
    name: string;
    price: number;
    maxBarbers: number;
    isActive?: boolean;
  }) {
    // Check if plan name already exists
    const existing = await PlansRepository.findByIdentifier(dto.name);
    if (existing) {
      return { status: 409, message: "Plan name already exists" };
    }

    const result = await PlansRepository.create(dto);
    return { status: 201, data: result[0], message: "Plan created successfully" };
  },

  async updatePlan(id: string, dto: {
    name?: string;
    price?: number;
    maxBarbers?: number;
    isActive?: boolean;
  }) {
    const existing = await PlansRepository.findById(id);
    if (!existing) {
      return { status: 404, message: "Plan not found" };
    }

    // Check if new name conflicts
    if (dto.name && dto.name !== existing.name) {
      const nameExists = await PlansRepository.findByIdentifier(dto.name);
      if (nameExists) {
        return { status: 409, message: "Plan name already exists" };
      }
    }

    const result = await PlansRepository.update(id, dto);
    return { status: 200, data: result[0], message: "Plan updated successfully" };
  },

  async deletePlan(id: string) {
    const existing = await PlansRepository.findById(id);
    if (!existing) {
      return { status: 404, message: "Plan not found" };
    }

    // Check if plan is being used by any active subscription
    const activeCount = await SubscriptionsRepository.countActiveByPlan(id);
    if (activeCount > 0) {
      return { status: 400, message: "Cannot delete plan with active subscriptions" };
    }

    await PlansRepository.delete(id);
    return { status: 200, message: "Plan deleted successfully" };
  },

  async getPlanStats() {
    const allPlans = await PlansRepository.findAll();
    const activePlans = await PlansRepository.findActivePlans();

    const stats = await Promise.all(
      allPlans.map(async (plan) => {
        const activeSubs = await SubscriptionsRepository.countActiveByPlan(plan.id);
        return {
          planId: plan.id,
          planName: plan.name,
          price: plan.price,
          maxBarbers: plan.maxBarbers,
          isActive: plan.isActive,
          totalSubscriptions: await SubscriptionsRepository.countByPlan(plan.id),
          activeSubscriptions: activeSubs,
        };
      })
    );

    return {
      status: 200,
      data: {
        totalPlans: allPlans.length,
        activePlans: activePlans.length,
        plans: stats,
      },
    };
  }
};
