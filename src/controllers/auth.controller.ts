// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "../db";
import { users } from "../db/schema";
import { signToken } from "../utils/jwt";
import { eq } from "drizzle-orm";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  // Cari user berdasarkan email
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = result[0];

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken({
    id: user.id,
    role: user.role,
  });

  res.cookie("access_token", token, {
    httpOnly: true,
    secure: true, // true kalau HTTPS
    sameSite: "none",
  });

  return res.json({
    message: "Login success",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

export function logout(req: Request, res: Response) {
  res.clearCookie("access_token");
  return res.json({ message: "Logout success" });
}

export async function me(req: Request, res: Response) {
  const userPayload = (req as unknown as {
    user?: {
      id: string;
      role: string;
    }
  }).user;

  if (!userPayload) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // Ambil data user lengkap dari database
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userPayload.id))
    .limit(1);

  const user = result[0];

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  return res.json({ user });
}
