// src/db/services.repository.ts
import { db } from "../db";
import { services } from "../db/schema";
import { eq } from "drizzle-orm";
import { InferInsertModel } from "drizzle-orm";

export type Service = typeof services.$inferSelect;
export type CreateServiceDto = InferInsertModel<typeof services>;

export const ServicesRepository = {
  create(data: CreateServiceDto) {
    return db.insert(services).values(data).returning();
  },

  findAll() {
    return db.select().from(services);
  },

  findById(id: string) {
    return db
      .select()
      .from(services)
      .where(eq(services.id, id))
      .limit(1);
  },

  update(id: string, data: Partial<CreateServiceDto>) {
    return db
      .update(services)
      .set(data)
      .where(eq(services.id, id))
      .returning();
  },

  delete(id: string) {
    return db.delete(services).where(eq(services.id, id));
  },
};
