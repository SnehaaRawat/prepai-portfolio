import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler";

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) return next(new AppError("Not authenticated.", 401));

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    next(new AppError("Invalid or expired session.", 401));
  }
}
