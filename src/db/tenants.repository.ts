// src/db/tenants.repository.ts
import { db } from "../db";
import { tenants } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type Tenant = InferSelectModel<typeof tenants>;
export type CreateTenantDto = InferInsertModel<typeof tenants>;
export type UpdateTenantDto = Partial<CreateTenantDto>;

export const TenantsRepository = {
  async findAll() {
    return db.select().from(tenants);
  },

  async findById(id: string) {
    const result = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, id))
      .limit(1);
    return result[0];
  },

  async findBySlug(slug: string) {
    const result = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);
    return result[0];
  },

  async create(data: CreateTenantDto) {
    return db.insert(tenants).values(data).returning();
  },

  async update(id: string, data: UpdateTenantDto) {
    return db
      .update(tenants)
      .set(data)
      .where(eq(tenants.id, id))
      .returning();
  },

  async delete(id: string) {
    return db.delete(tenants).where(eq(tenants.id, id));
  },

  async findByPhone(phone: string) {
    return db
      .select()
      .from(tenants)
      .where(eq(tenants.phone, phone))
      .limit(1);
  },

  async countActive() {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenants)
      .where(eq(tenants.isActive, true));
    return Number(result[0]?.count || 0);
  }
};
