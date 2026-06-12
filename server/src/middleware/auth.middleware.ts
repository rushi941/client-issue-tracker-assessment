import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { AUTH_COOKIE, verifyToken } from "../lib/jwt";
import { AppError } from "../utils/app-error";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: Role;
  };
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) {
    return next(new AppError(401, "Authentication required"));
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new AppError(401, "Invalid or expired token"));
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "Authentication required"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "Insufficient permissions"));
    }
    next();
  };
}
