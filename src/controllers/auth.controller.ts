// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const result = await AuthService.login({ email, password });

  if (result.status !== 200 || !result.data) {
    return res.status(result.status).json({ message: result.message });
  }

  // Set cookie with access token
  res.cookie("access_token", result.data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain: process.env.NODE_ENV === "production" ? ".magentaa.space" : undefined,
    path: "/",
  });

  return res.json({
    message: "Login success",
    user: result.data.user,
  });
}

export async function logout(req: Request, res: Response) {
  const userPayload = (req as unknown as { user?: { id: string } }).user;
  
  if (userPayload) {
    await AuthService.logout(userPayload.id);
  }

  res.clearCookie("access_token");
  return res.json({ message: "Logout success" });
}

export async function logoutAll(req: Request, res: Response) {
  const userPayload = (req as unknown as { user?: { id: string } }).user;
  
  if (!userPayload) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const result = await AuthService.logoutAll(userPayload.id);
  res.clearCookie("access_token");
  return res.status(result.status).json({ message: result.message });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  const result = await AuthService.refreshToken(refreshToken);

  if (result.status !== 200 || !result.data) {
    return res.status(result.status).json({ message: result.message });
  }

  // Set new access token in cookie
  res.cookie("access_token", result.data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain: process.env.NODE_ENV === "production" ? ".magentaa.space" : undefined,
    path: "/",
  });

  return res.json({ message: "Token refreshed successfully" });
}

export async function me(req: Request, res: Response) {
  const userPayload = (req as unknown as {
    user?: {
      id: string;
      role: string;
      email: string;
      tenant_id: string;
    }
  }).user;

  if (!userPayload) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // The user data is already attached by auth middleware
  return res.json({ user: userPayload });
}

export async function changePassword(req: Request, res: Response) {
  const userPayload = (req as unknown as { user?: { id: string } }).user;
  
  if (!userPayload) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current password and new password are required" });
  }

  const result = await AuthService.changePassword(userPayload.id, currentPassword, newPassword);
  return res.status(result.status).json({ message: result.message });
}
