import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./index";

async function reset() {
  console.log("Resetting database schema (dropping public cascade)...");
  await db.execute(sql`DROP SCHEMA public CASCADE;`);
  await db.execute(sql`CREATE SCHEMA public;`);
  await db.execute(sql`GRANT ALL ON SCHEMA public TO postgres;`);
  await db.execute(sql`GRANT ALL ON SCHEMA public TO public;`);
  console.log("Database schema reset complete!");
  process.exit(0);
}

reset().catch((e) => {
  console.error("Failed to reset database:", e);
  process.exit(1);
});
