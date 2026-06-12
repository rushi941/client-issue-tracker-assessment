import { ActivityType, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class ActivityRepository {
  create(data: {
    issueId: string;
    actorId: string;
    type: ActivityType;
    message: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return prisma.activityLog.create({
      data,
      include: {
        actor: { select: { id: true, name: true, role: true } },
      },
    });
  }

  findByIssueId(issueId: string) {
    return prisma.activityLog.findMany({
      where: { issueId },
      include: {
        actor: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }
}

export const activityRepository = new ActivityRepository();
