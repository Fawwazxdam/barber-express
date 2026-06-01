import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import authRoutes from "./routes/auth.route";
import { servicesRouter } from "./routes/services.route";
import { usersRouter } from "./routes/users.route";
import { bookingsRouter } from "./routes/bookings.route";
import { mediaRouter } from "./routes/media.route";
import { tenantsRouter } from "./routes/tenants.route";
import { plansRouter } from "./routes/plans.route";
import { subscriptionsRouter } from "./routes/subscriptions.route";
import subscriptionTransactionsRouter from "./routes/subscriptionTransactions.route";
import superadminRouter from "./routes/superadmin.route";
import { barberSchedulesRouter } from "./routes/barberSchedules.route";
import onboardingRoutes from "./routes/onboarding.route";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
  res.send("hello world");
});

app.use("/auth", authRoutes);
app.use("/services", servicesRouter);
app.use("/users", usersRouter);
app.use("/bookings", bookingsRouter);
app.use("/media", mediaRouter);
app.use("/tenants", tenantsRouter);
app.use("/plans", plansRouter);
app.use("/subscriptions", subscriptionsRouter);
app.use("/subscription-transactions", subscriptionTransactionsRouter);
app.use("/superadmin", superadminRouter);
app.use("/", barberSchedulesRouter);
app.use("/onboarding", onboardingRoutes);

export default app;
