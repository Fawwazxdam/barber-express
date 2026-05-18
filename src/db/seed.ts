// src/db/seed.ts
import "dotenv/config";
import bcrypt from "bcrypt";
import { db } from "./index";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  const password = await bcrypt.hash("password", 10);

  // Check if admin user already exists
  const existingUser = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "admin@barber.com"))
    .limit(1);

  if (existingUser[0]) {
    console.log("Admin user already exists!");
    return;
  }

  // Insert tenant
  const [tenant] = await db.insert(schema.tenants).values({
    name: "Barber Express",
    slug: "barber-express",
    phone: "+6281234567890",
    address: "Jl. Contoh No. 123",
    openTime: "09:00",
    closeTime: "21:00",
  }).returning();

  if (!tenant) {
    throw new Error("Failed to create tenant");
  }

  // Insert admin user
  const [adminUser] = await db.insert(schema.users).values({
    name: "Admin",
    email: "admin@barber.com",
    password,
    role: "ADMIN",
    tenantId: tenant.id,
  }).returning();

  if (!adminUser) {
    throw new Error("Failed to create admin user");
  }

  // Insert barber user
  const [barberUser] = await db.insert(schema.users).values({
    name: "Barber John",
    email: "barber@barber.com",
    password: await bcrypt.hash("password", 10),
    role: "BARBER",
    tenantId: tenant.id,
    description: "Senior barber with 10+ years experience",
  }).returning();

  if (!barberUser) {
    throw new Error("Failed to create barber user");
  }

  // Insert plans
  const plansResult = await db.insert(schema.plans).values([
    { name: "Basic", price: 0, maxBarbers: 1, isActive: true },
    { name: "Premium", price: 50000, maxBarbers: 5, isActive: true },
  ]).returning();

  const basicPlan = plansResult[0];
  const premiumPlan = plansResult[1];

  if (!basicPlan || !premiumPlan) {
    throw new Error("Failed to create plans");
  }

  // Insert subscription
  const now = new Date();
  const nextMonth = new Date(now.setMonth(now.getMonth() + 1));
  await db.insert(schema.subscriptions).values({
    tenantId: tenant.id,
    planId: premiumPlan.id,
    status: "active" as const,
    startsAt: new Date(),
    endsAt: nextMonth,
  });

  // Insert services
  const servicesResult = await db.insert(schema.services).values([
    { tenantId: tenant.id, name: "Hair Cut", price: 50000, duration: 30, isActive: true },
    { tenantId: tenant.id, name: "Beard Shave", price: 30000, duration: 20, isActive: true },
    { tenantId: tenant.id, name: "Hair Styling", price: 80000, duration: 45, isActive: true },
  ]).returning();

  const cut = servicesResult[0];
  const shave = servicesResult[1];

  if (!cut || !shave) {
    throw new Error("Failed to create services");
  }

  // Insert customer user
  const [customerUser] = await db.insert(schema.users).values({
    name: "Customer One",
    email: "customer1@barber.com",
    password: await bcrypt.hash("password", 10),
    role: "BARBER",
    tenantId: tenant.id,
  }).returning();

  if (!customerUser) {
    throw new Error("Failed to create customer user");
  }

  // Insert bookings
  const bookingDate1 = new Date();
  bookingDate1.setHours(10, 0, 0, 0);
  const bookingDate2 = new Date();
  bookingDate2.setDate(bookingDate2.getDate() + 1);
  bookingDate2.setHours(14, 0, 0, 0);

  await db.insert(schema.bookings).values([
    {
      tenantId: tenant.id,
      barberId: barberUser.id,
      serviceId: cut.id,
      customerUserId: customerUser.id,
      customerName: "Customer One",
      customerPhone: "+628111111111",
      customerNote: "Prefer short cut on sides",
      bookingDate: bookingDate1,
      status: "confirmed" as const,
    },
    {
      tenantId: tenant.id,
      barberId: barberUser.id,
      serviceId: shave.id,
      customerUserId: null,
      customerName: "Walk-in Customer",
      customerPhone: "+628222222222",
      customerNote: "",
      bookingDate: bookingDate2,
      status: "pending" as const,
    }
  ]);

  console.log("Seed data created successfully!");
  console.log("- Tenant: Barber Express");
  console.log("- Admin: admin@barber.com (password: password)");
  console.log("- Barber: barber@barber.com (password: password)");
  console.log("- Customer: customer1@barber.com (password: password)");
  console.log("- Services: Hair Cut, Beard Shave, Hair Styling");
  console.log("- Plans: Basic, Premium");
  console.log("- Bookings: 2 created");
}

seed().catch(console.error);
