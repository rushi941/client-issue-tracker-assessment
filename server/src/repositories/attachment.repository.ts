import { prisma } from "../lib/prisma";

export class AttachmentRepository {
  findByIssueId(issueId: string) {
    return prisma.attachment.findMany({
      where: { issueId },
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const attachmentRepository = new AttachmentRepository();
