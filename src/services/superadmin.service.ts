import { TenantsRepository } from "../db/tenants.repository";
import { SubscriptionsRepository } from "../db/subscriptions.repository";
import { SubscriptionTransactionsRepository } from "../db/subscriptionTransactions.repository";
import { UsersRepository } from "../db/users.repository";
import bcrypt from "bcrypt";

export class SuperadminService {
  static async getDashboardStats() {
    // Basic aggregation for superadmin dashboard
    
    // 1. Total Tenants
    const allTenants = await TenantsRepository.findAll();
    const totalTenants = allTenants.length;
    
    // 2. Active Tenants (Based on tenant's isActive field, not subscription)
    const activeTenants = await TenantsRepository.countActive();

    // 3. Pending Transactions count
    const allTransactions = await SubscriptionTransactionsRepository.findAll();
    const pendingTransactions = allTransactions.filter(tx => tx.status === "pending").length;
    
    // 4. Total Revenue (sum of all approved transactions amount)
    const totalRevenue = allTransactions
      .filter(tx => tx.status === "approved")
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      totalTenants,
      activeTenants,
      pendingTransactions,
      totalRevenue,
    };
  }

  static async getAllTenantsWithStatus() {
    const tenants = await TenantsRepository.findAll();
    
    // We should ideally use a JOIN query in repository for better performance,
    // but mapping here is fine for MVP.
    const enrichedTenants = await Promise.all(
      tenants.map(async (tenant) => {
        const activeSub = await SubscriptionsRepository.findCurrentByTenantId(tenant.id);
        
        let subStatus = "expired";
        if (activeSub && activeSub.endsAt > new Date()) {
          subStatus = "active";
        }
        
        return {
          ...tenant,
          subscription: activeSub ? {
            planName: activeSub.planName,
            endsAt: activeSub.endsAt,
            status: subStatus
          } : null
        };
      })
    );

    return enrichedTenants;
  }

  static async createTenantWithOwner(data: any) {
    const { tenantName, slug, phone, address, ownerName, ownerEmail, ownerPassword } = data;

    // Check if slug exists
    const existingTenant = await TenantsRepository.findBySlug(slug);
    if (existingTenant) {
      throw new Error("Slug already exists");
    }

    // 1. Create Tenant
    const [tenant] = await TenantsRepository.create({
      name: tenantName,
      slug,
      phone,
      address,
      openTime: "09:00",
      closeTime: "21:00"
    });

    if (!tenant) {
      throw new Error("Failed to create tenant");
    }

    // 2. Create Owner User
    const hashedPassword = await bcrypt.hash(ownerPassword, 10);
    const [user] = await UsersRepository.create({
      name: ownerName,
      email: ownerEmail,
      password: hashedPassword,
      role: "ADMIN",
      tenantId: tenant.id
    });

    return { tenant, user };
  }

  static async updateTenant(id: string, data: any) {
    const [updated] = await TenantsRepository.update(id, data);
    if (!updated) throw new Error("Tenant not found");
    return updated;
  }

  static async deleteTenant(id: string) {
    // Note: cascade delete in DB schema should handle users/bookings
    // if tenant is deleted. Otherwise we need to delete them manually.
    await TenantsRepository.delete(id);
    return true;
  }
}
