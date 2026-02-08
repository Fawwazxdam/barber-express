// src/db/users.repository.ts
import { db } from "../db";
import { users } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { InferInsertModel } from "drizzle-orm";

export type User = typeof users.$inferSelect;
export type CreateUserDto = InferInsertModel<typeof users>;

export const UsersRepository = {
  async findById(id: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0];
  },

  findByEmail(email: string) {
    return db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .then((res) => res[0]);
  },

  findBarbers() {
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, "BARBER"));
  },

  async findBarberById(id: string) {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(eq(users.id, id), eq(users.role, "BARBER")))
      .limit(1);
    return result[0];
  },

  create(data: CreateUserDto) {
    return db.insert(users).values(data).returning();
  },

  update(id: string, data: Partial<CreateUserDto>) {
    return db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
  },
};
