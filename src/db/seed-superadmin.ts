import "dotenv/config";
import bcrypt from "bcrypt";
import { db } from "./index";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

async function seedSuperadmin() {
  const email = "adamf@magentaa.space";
  const password = await bcrypt.hash("password", 10);

  // Check if superadmin already exists
  const existingUser = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  if (existingUser[0]) {
    console.log("Superadmin user already exists!");
    return;
  }

  const [superAdminUser] = await db.insert(schema.users).values({
    name: "Adam (Super Admin)",
    email,
    password,
    role: "ADMIN", // Kita pakai ADMIN di database, karena otorisasi dicek berdasarkan kecocokan email
  }).returning();

  if (!superAdminUser) {
    throw new Error("Failed to create superadmin user");
  }

  console.log(`Superadmin created successfully!`);
  console.log(`Email: ${email}`);
  console.log(`Password: password`);
  console.log(`PENTING: Pastikan file .env kamu memiliki baris:`);
  console.log(`SUPERADMIN_EMAIL=${email}`);
}

seedSuperadmin().catch(console.error);
