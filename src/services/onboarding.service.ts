import { db } from "../db/index";
import { tenants, users, subscriptions, plans } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { TenantsRepository } from "../db/tenants.repository";
import { UsersRepository } from "../db/users.repository";
import { PlansRepository } from "../db/plans.repository";
import { SubscriptionsRepository } from "../db/subscriptions.repository";
import { AppError } from "./tenants.service";

export const OnboardingService = {
  async registerTenant(dto: {
    tenant: {
      name: string;
      slug: string;
      phone?: string;
      address?: string;
      openTime?: string;
      closeTime?: string;
    };
    admin: {
      name: string;
      email: string;
      password: string;
    };
    planId?: string; // Optional - if not provided, uses STARTER plan
  }) {
    // Validate required fields
    if (!dto.tenant.name || !dto.tenant.slug) {
      throw new AppError("Tenant name and slug are required", 400);
    }
    
    if (!dto.admin.name || !dto.admin.email || !dto.admin.password) {
      throw new AppError("Admin name, email, and password are required", 400);
    }
    
    return await db.transaction(async (tx) => {
      // 1. Check if tenant slug exists
      const existingTenant = await tx.query.tenants.findFirst({
        where: eq(tenants.slug, dto.tenant.slug),
      });
      if (existingTenant) {
        throw new AppError("Slug already exists", 409);
      }

      // 2. Check if admin email already exists
      const existingUser = await tx.query.users.findFirst({
        where: eq(users.email, dto.admin.email),
      });
      if (existingUser) {
        throw new AppError("Email already exists", 409);
      }

      // 3. Create tenant
      const [tenant] = await tx
        .insert(tenants)
        .values({
          name: dto.tenant.name,
          slug: dto.tenant.slug,
          phone: dto.tenant.phone,
          address: dto.tenant.address,
          openTime: dto.tenant.openTime,
          closeTime: dto.tenant.closeTime,
        })
        .returning();

      if (!tenant) {
        throw new AppError("Failed to create tenant", 500);
      }

      // 4. Create admin user
      const hashedPassword = await bcrypt.hash(dto.admin.password, 10);
      const [adminUser] = await tx
        .insert(users)
        .values({
          tenantId: tenant.id,
          name: dto.admin.name,
          email: dto.admin.email,
          password: hashedPassword,
          role: "ADMIN",
        })
        .returning();

      if (!adminUser) {
        throw new AppError("Failed to create admin user", 500);
      }

      // 5. Subscription is no longer created automatically.
      // Tenants must choose a plan and submit payment proof via the Billing dashboard.

      return {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
        },
        admin: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
        },
      };
    });
  }
};