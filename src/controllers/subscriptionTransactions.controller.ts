import { Request, Response } from "express";
import { SubscriptionTransactionsService } from "../services/subscriptionTransactions.service";

export class SubscriptionTransactionsController {
  static async createTransaction(req: Request, res: Response) {
    try {
      const { planId, amount, notes } = req.body;
      const user = (req as any).user;
      const tenantId = user?.tenantId;
      const file = req.file as Express.Multer.File | undefined;
      
      let paymentProofUrl = req.body.paymentProofUrl;
      if (file) {
        paymentProofUrl = `/uploads/${file.filename}`;
      }

      if (!tenantId) {
        return res.status(401).json({ message: "Unauthorized. Tenant ID is missing." });
      }

      if (!planId || !amount) {
        return res.status(400).json({ message: "Missing required fields: planId, amount" });
      }

      const transaction = await SubscriptionTransactionsService.createTransaction({
        tenantId,
        planId,
        amount,
        paymentProofUrl,
        notes,
      });

      return res.status(201).json({ message: "Transaction created successfully", transaction });
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async getTenantTransactions(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const tenantId = user?.tenantId;

      if (!tenantId) {
        return res.status(401).json({ message: "Unauthorized. Tenant ID is missing." });
      }

      const transactions = await SubscriptionTransactionsService.getTenantTransactions(tenantId);
      return res.status(200).json(transactions);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async getAllTransactions(req: Request, res: Response) {
    try {
      // Superadmin authorization handled by middleware

      const transactions = await SubscriptionTransactionsService.getAllTransactions();
      return res.status(200).json(transactions);
    } catch (error: any) {
      console.error("Error fetching all transactions:", error);
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async updateTransactionStatus(req: Request, res: Response) {
    try {
      // Superadmin authorization handled by middleware

      const id = req.params.id as string;
      const { status, notes } = req.body;

      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const transaction = await SubscriptionTransactionsService.updateTransactionStatus(id, status, notes);
      return res.status(200).json({ message: "Transaction updated successfully", transaction });
    } catch (error: any) {
      console.error("Error updating transaction status:", error);
      if (error.message === "Transaction not found") {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }
}
