import { Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { AUTH_COOKIE } from "../lib/jwt";
import { AuthRequest } from "../middleware/auth.middleware";
import { env } from "../config/env";

export class AuthController {
  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.cookie(AUTH_COOKIE, result.token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json({ data: { user: result.user } });
    } catch (err) {
      next(err);
    }
  }

  logout(_req: AuthRequest, res: Response) {
    res.clearCookie(AUTH_COOKIE);
    res.json({ data: { message: "Logged out" } });
  }

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.userId);
      res.json({ data: user });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
