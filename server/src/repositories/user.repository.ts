import { prisma } from "../lib/prisma";

export class UserRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  findManagers() {
    return prisma.user.findMany({
      where: { role: "MANAGER" },
      select: { id: true, name: true, email: true },
    });
  }
}

export const userRepository = new UserRepository();
