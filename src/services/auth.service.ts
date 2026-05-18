// src/services/auth.service.ts
import jwt, { JwtPayload } from "jsonwebtoken";
import { signToken, verifyToken, TokenPayload } from "../utils/jwt";
import { RefreshTokensRepository } from "../db/refreshTokens.repository";
import { UsersRepository } from "../db/users.repository";
import bcrypt from "bcrypt";

export const AuthService = {
  async login(dto: { email: string; password: string }) {
    const user = await UsersRepository.findByEmail(dto.email);
    if (!user) {
      return { status: 401, message: "Invalid credentials" };
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      return { status: 401, message: "Invalid credentials" };
    }

    const accessToken = signToken({
      id: user.id,
      role: user.role,
      tenantId: user.tenantId,
      email: user.email,
    });

    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days

    const refreshTokenResult = await RefreshTokensRepository.create({
      token: accessToken, // In production, use separate refresh token
      userId: user.id,
      expiresAt: refreshTokenExpiry,
    });

    return {
      status: 200,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
      },
    };
  },

  async logout(userId: string) {
    await RefreshTokensRepository.deleteByUserId(userId);
    return { status: 200, message: "Logged out successfully" };
  },

  async logoutAll(userId: string) {
    await RefreshTokensRepository.cleanupUserTokens(userId);
    return { status: 200, message: "Logged out from all devices" };
  },

  async refreshToken(token: string) {
    try {
      const payload = verifyToken(token);
      const user = await UsersRepository.findById(payload.id);

      if (!user) {
        return { status: 404, message: "User not found" };
      }

      // Check if refresh token exists
      const refreshToken = await RefreshTokensRepository.findByToken(token);
      if (!refreshToken) {
        return { status: 401, message: "Invalid refresh token" };
      }

      // Check if refresh token is expired
      if (refreshToken.expiresAt < new Date()) {
        await RefreshTokensRepository.deleteByToken(token);
        return { status: 401, message: "Refresh token expired" };
      }

      // Generate new access token
      const newAccessToken = signToken({
        id: user.id,
        role: user.role,
        tenantId: user.tenantId,
        email: user.email,
      });

      // Optionally rotate refresh token
      await RefreshTokensRepository.deleteByToken(token);
      const newRefreshTokenExpiry = new Date();
      newRefreshTokenExpiry.setDate(newRefreshTokenExpiry.getDate() + 7);
      await RefreshTokensRepository.create({
        token: newAccessToken,
        userId: user.id,
        expiresAt: newRefreshTokenExpiry,
      });

      return {
        status: 200,
        data: {
          accessToken: newAccessToken,
        },
      };
    } catch (error) {
      return { status: 401, message: "Invalid token" };
    }
  },

  async validateToken(token: string) {
    try {
      const payload = verifyToken(token);
      const user = await UsersRepository.findById(payload.id);
      if (!user) {
        return { status: 404, message: "User not found" };
      }

      const refreshToken = await RefreshTokensRepository.findByToken(token);
      if (!refreshToken || refreshToken.expiresAt < new Date()) {
        return { status: 401, message: "Token expired or invalid" };
      }

      return {
        status: 200,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      };
    } catch (error) {
      return { status: 401, message: "Invalid token" };
    }
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await UsersRepository.findById(userId);
    if (!user) {
      return { status: 404, message: "User not found" };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return { status: 401, message: "Current password is incorrect" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UsersRepository.update(userId, { password: hashedPassword });

    // Invalidate all existing sessions
    await RefreshTokensRepository.deleteByUserId(userId);

    return { status: 200, message: "Password changed successfully" };
  }
};
