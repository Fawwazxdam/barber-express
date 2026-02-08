// src/types/express.d.ts
import type { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
        [key: string]: unknown;
      };
    }
  }
}
