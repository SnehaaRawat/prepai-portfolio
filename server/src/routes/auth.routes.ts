import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../middleware/errorHandler";

const router = Router();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;

function issueToken(res: any, userId: string) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: Number(process.env.JWT_EXPIRES_IN) || SEVEN_DAYS_IN_SECONDS,
  });
  res.cookie("token", token, cookieOptions);
}

const signupSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8),
});

router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const { name, email, password } = signupSchema.parse(req.body);

    const existing = await User.findOne({ email });
    if (existing) throw new AppError("An account with that email already exists.", 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    issueToken(res, user._id.toString());
    res.status(201).json({ id: user._id, name: user.name, email: user.email });
  })
);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) throw new AppError("Invalid email or password.", 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError("Invalid email or password.", 401);

    issueToken(res, user._id.toString());
    res.json({ id: user._id, name: user.name, email: user.email });
  })
);

// Zero-friction demo mode for portfolio viewers — no signup required
router.post(
  "/guest",
  asyncHandler(async (_req, res) => {
    const guestEmail = `guest-${Date.now()}@demo.prepai`;
    const passwordHash = await bcrypt.hash(Math.random().toString(36), 12);
    const user = await User.create({ name: "Guest", email: guestEmail, passwordHash, isGuest: true });

    issueToken(res, user._id.toString());
    res.status(201).json({ id: user._id, name: user.name, email: user.email, isGuest: true });
  })
);

router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.status(204).send();
});

export default router;
