import jwt, { SignOptions } from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export const AUTH_COOKIE = "auth_token";
