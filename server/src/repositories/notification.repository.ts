import { NotificationType } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class NotificationRepository {
  create(data: { userId: string; type: NotificationType; message: string; issueId?: string }) {
    return prisma.notification.create({ data });
  }

  findByUserId(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      include: {
        issue: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  countUnread(userId: string) {
    return prisma.notification.count({
      where: { userId, readAt: null },
    });
  }

  markRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
  }

  markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}

export const notificationRepository = new NotificationRepository();
