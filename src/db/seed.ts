// src/db/seed.ts
import "dotenv/config";
import bcrypt from "bcrypt";
import { db } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  const password = await bcrypt.hash("password", 10);

  // Check if admin user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, "admin@barber.com"))
    .limit(1);

  if (existingUser[0]) {
    console.log("Admin user already exists!");
    return;
  }

  // Insert admin user
  await db.insert(users).values({
    name: "Admin",
    email: "admin@barber.com",
    password,
    role: "ADMIN",
  });

  console.log("Admin user created!");
}

seed().catch(console.error);
