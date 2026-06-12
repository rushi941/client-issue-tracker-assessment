import { IssueSeverity, IssueStatus, Prisma, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { IssueSortField, ListIssuesQuery, PaginatedResult, SortOrder } from "../types/pagination.types";

const issueInclude = {
  website: { select: { id: true, name: true, url: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  assignee: { select: { id: true, name: true, email: true } },
  _count: { select: { comments: true } },
} as const;

function buildWhere(
  userId: string,
  role: Role,
  filters: Pick<ListIssuesQuery, "status" | "search" | "severity" | "createdFrom" | "createdTo">,
): Prisma.IssueWhereInput {
  const where: Prisma.IssueWhereInput = role === "MANAGER" ? {} : { createdById: userId };

  if (filters.status) where.status = filters.status as IssueStatus;
  if (filters.severity) where.severity = filters.severity as IssueSeverity;

  if (filters.createdFrom || filters.createdTo) {
    where.createdAt = {};
    if (filters.createdFrom) {
      const from = new Date(filters.createdFrom);
      from.setHours(0, 0, 0, 0);
      where.createdAt.gte = from;
    }
    if (filters.createdTo) {
      const to = new Date(filters.createdTo);
      to.setHours(23, 59, 59, 999);
      where.createdAt.lte = to;
    }
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}

function buildOrderBy(sortBy: IssueSortField, sortOrder: SortOrder): Prisma.IssueOrderByWithRelationInput {
  return { [sortBy]: sortOrder };
}

export class IssueRepository {
  async findManyForUser(
    userId: string,
    role: Role,
    query: ListIssuesQuery,
  ): Promise<PaginatedResult<Awaited<ReturnType<typeof prisma.issue.findMany>>[number]>> {
    const where = buildWhere(userId, role, query);
    const skip = (query.page - 1) * query.pageSize;
    const orderBy = buildOrderBy(query.sortBy, query.sortOrder);

    const [items, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        include: issueInclude,
        orderBy,
        skip,
        take: query.pageSize,
      }),
      prisma.issue.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
    };
  }

  findById(id: string) {
    return prisma.issue.findUnique({
      where: { id },
      include: {
        website: true,
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        assignee: { select: { id: true, name: true, email: true } },
        comments: {
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
        attachments: {
          include: { uploadedBy: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  create(data: Prisma.IssueCreateInput) {
    return prisma.issue.create({
      data,
      include: {
        website: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  update(id: string, data: Prisma.IssueUpdateInput) {
    return prisma.issue.update({
      where: { id },
      data,
      include: {
        website: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    });
  }

  getAnalytics() {
    return prisma.issue.findMany({
      select: {
        id: true,
        status: true,
        severity: true,
        createdAt: true,
        resolvedAt: true,
      },
    });
  }
}

export const issueRepository = new IssueRepository();
