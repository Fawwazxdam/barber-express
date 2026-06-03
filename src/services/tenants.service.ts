// src/services/tenants.service.ts
import { TenantsRepository } from "../db/tenants.repository";
import { PlansRepository } from "../db/plans.repository";
import { SubscriptionsRepository } from "../db/subscriptions.repository";
import { UsersRepository } from "../db/users.repository";
import { BookingsRepository } from "../db/bookings.repository";
import { TransactionsRepository } from "../db/transactions.repository";
import { tenants } from "../db/schema";
import { InferSelectModel } from "drizzle-orm";

export type Tenant = InferSelectModel<typeof tenants>;

// Bikin class Error sederhana untuk melempar status code ke Controller
export class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.name = "AppError";
  }
}

export const TenantsService = {
  async getAllTenants() {
    return await TenantsRepository.findAll();
  },

  async getTenantById(id: string) {
    const tenant = await TenantsRepository.findById(id);
    if (!tenant) throw new AppError("Tenant not found", 404);
    return tenant;
  },

  async getTenantBySlug(slug: string) {
    const tenant = await TenantsRepository.findBySlug(slug);
    if (!tenant) throw new AppError("Tenant not found", 404);
    const activeSubscription = await SubscriptionsRepository.findActiveByTenantId(tenant.id);
    return { ...tenant, hasActiveSubscription: !!activeSubscription };
  },

  async getTenantByToken(tenantId: string) {
    const tenant = await TenantsRepository.findById(tenantId);
    if (!tenant) throw new AppError("Tenant not found", 404);
    const activeSubscription = await SubscriptionsRepository.findActiveByTenantId(tenant.id);
    return { ...tenant, hasActiveSubscription: !!activeSubscription };
  },

  async createTenant(dto: {
    name: string;
    slug: string;
    phone?: string;
    address?: string;
    openTime?: string;
    closeTime?: string;
  }) {
    const existingSlug = await TenantsRepository.findBySlug(dto.slug);
    if (existingSlug) throw new AppError("Slug already exists", 409);

    if (dto.phone) {
      const existingPhone = await TenantsRepository.findByPhone(dto.phone);
      if (existingPhone) throw new AppError("Phone number already registered", 409);
    }

    const result = await TenantsRepository.create(dto);
    return result[0];
  },

  async updateTenant(id: string, dto: {
    name?: string;
    phone?: string;
    address?: string;
    openTime?: string;
    closeTime?: string;
    isActive?: boolean;
  }) {
    const existing = await TenantsRepository.findById(id);
    if (!existing) throw new AppError("Tenant not found", 404);

    if (dto.phone && dto.phone !== existing.phone) {
      const existingPhone = await TenantsRepository.findByPhone(dto.phone);
      if (existingPhone) throw new AppError("Phone number already registered", 409);
    }

    const result = await TenantsRepository.update(id, dto);
    return result[0];
  },

  async deleteTenant(id: string) {
    const existing = await TenantsRepository.findById(id);
    if (!existing) throw new AppError("Tenant not found", 404);

    const activeSubscription = await SubscriptionsRepository.findActiveByTenantId(id);
    if (activeSubscription) {
      throw new AppError("Cannot delete tenant with active subscription", 400);
    }

    const barbers = await UsersRepository.findBarbers(id);
    if (barbers.length > 0) {
      throw new AppError("Cannot delete tenant with existing barbers", 400);
    }

    await TenantsRepository.delete(id);
    return true; 
  },

  async getTenantStats(tenantId: string) {
    const tenant = await TenantsRepository.findById(tenantId);
    if (!tenant) throw new AppError("Tenant not found", 404);

    const [barberCount, bookingCount, activeSubscription] = await Promise.all([
      UsersRepository.findBarbers(tenantId).then((barbers) => barbers.length),
      BookingsRepository.countBookingsByTenantToday(tenantId),
      SubscriptionsRepository.findActiveByTenantId(tenantId),
    ]);

    return {
      barberCount,
      bookingCount,
      hasActiveSubscription: !!activeSubscription,
      subscription: activeSubscription
        ? {
            plan: activeSubscription.planName,
            endsAt: activeSubscription.endsAt,
          }
        : null,
    };
  },

  async getDashboardStats(tenantId: string) {
    const tenant = await TenantsRepository.findById(tenantId);
    if (!tenant) throw new AppError("Tenant not found", 404);

    const [activeBarbers, todayBookings, pendingBookings, todayRevenue] = await Promise.all([
      UsersRepository.findBarbers(tenantId).then((barbers) => barbers.length),
      BookingsRepository.countBookingsByTenantToday(tenantId),
      BookingsRepository.countPendingBookingsByTenant(tenantId),
      TransactionsRepository.getRevenueByTenantToday(tenantId),
    ]);

    return {
      tenantName: tenant.name,
      activeBarbers,
      todayBookings,
      pendingBookings,
      todayRevenue,
      openTime: tenant.openTime,
      closeTime: tenant.closeTime,
    };
  }
};