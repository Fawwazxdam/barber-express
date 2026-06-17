import { Request, Response } from "express";
import { OnboardingService } from "../services/onboarding.service";

export const OnboardingController = {
  async registerTenant(req: Request, res: Response) {
    try {
      const result = await OnboardingService.registerTenant(req.body);
      return res.status(201).json({
        status: 201,
        message: "Tenant and admin user created successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Onboarding error:", error);
      const status = error.statusCode || 500;
      return res.status(status).json({
        status,
        message: error.message || "Failed to register tenant",
        data: null,
      });
    }
  },

  async verifyEmail(req: Request, res: Response) {
    try {
      const { email, token } = req.body;
      if (!email || !token) {
        return res.status(400).json({ status: 400, message: "Email and token are required", data: null });
      }
      
      await OnboardingService.verifyEmail(email, token);
      return res.status(200).json({
        status: 200,
        message: "Email verified successfully",
        data: null,
      });
    } catch (error: any) {
      console.error("Verification error:", error);
      const status = error.statusCode || 500;
      return res.status(status).json({
        status,
        message: error.message || "Failed to verify email",
        data: null,
      });
    }
  },
};