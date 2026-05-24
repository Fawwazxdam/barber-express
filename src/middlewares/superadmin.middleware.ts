import { Request, Response, NextFunction } from "express";

export function requireSuperadmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;

  // We check if the user's email matches the configured Superadmin Email.
  // Make sure to add SUPERADMIN_EMAIL to your .env file
  const superAdminEmail = process.env.SUPERADMIN_EMAIL;

  if (!user || !user.email) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  if (user.email !== superAdminEmail) {
    return res.status(403).json({ message: "Forbidden. Only superadmin can perform this action." });
  }

  next();
}
