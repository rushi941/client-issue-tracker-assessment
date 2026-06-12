import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/user.repository";
import { signToken } from "../lib/jwt";
import { AppError } from "../utils/app-error";

export class AuthService {
  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, "Invalid email or password");
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, "User not found");
    return user;
  }
}

export const authService = new AuthService();
