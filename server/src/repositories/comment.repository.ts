import { prisma } from "../lib/prisma";

export class CommentRepository {
  create(data: { issueId: string; authorId: string; body: string; isManagerResponse: boolean }) {
    return prisma.comment.create({
      data,
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    });
  }
}

export const commentRepository = new CommentRepository();
