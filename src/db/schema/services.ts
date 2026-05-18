import { pgTable, uuid, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  price: integer("price").notNull(),
  duration: integer("duration").notNull(),
  isActive: boolean("is_active").default(true),
});
