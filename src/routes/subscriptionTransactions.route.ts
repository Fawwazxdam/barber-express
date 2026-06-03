import { Router } from "express";
import { SubscriptionTransactionsController } from "../controllers/subscriptionTransactions.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireSuperadmin } from "../middlewares/superadmin.middleware";
import { upload } from "../config/multer";

const router = Router();

// Multer middleware for file uploads
const uploadSingle = upload.single("paymentProof");

// Wrap handler to handle multer errors
const handleUpload = (handler: (req: any, res: any) => Promise<any>) => {
  return (req: any, res: any) => {
    uploadSingle(req, res, (err: any) => {
      if (err instanceof Error) {
        console.error("Multer error:", err.message);
        return res.status(400).json({ message: err.message });
      }
      handler(req, res);
    });
  };
};

// Routes for tenants (barbershops)
router.post("/", requireAuth, handleUpload(SubscriptionTransactionsController.createTransaction));
router.get("/my-transactions", requireAuth, SubscriptionTransactionsController.getTenantTransactions);

// Routes for superadmin
router.get("/all", requireAuth, requireSuperadmin, SubscriptionTransactionsController.getAllTransactions);
router.put("/:id/status", requireAuth, requireSuperadmin, SubscriptionTransactionsController.updateTransactionStatus);

export default router;
