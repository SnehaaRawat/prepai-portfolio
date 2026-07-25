import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import interviewRoutes from "./routes/interview.routes";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/interview", aiLimiter, interviewRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[server] PrepAI API running on port ${PORT}`);
});

connectDB().catch((err) => {
  console.error("[server] MongoDB connection failed:", err.message);
});
