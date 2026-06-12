import { IssueStatus, Prisma, Role, WebsiteStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ListWebsitesQuery, SortOrder, WebsiteSortField } from "../types/pagination.types";

const openIssuesFilter = {
  status: { notIn: [IssueStatus.RESOLVED, IssueStatus.CLOSED] },
};

function buildWhere(
  userId: string,
  role: Role,
  filters: Pick<ListWebsitesQuery, "status" | "search" | "createdFrom" | "createdTo">,
): Prisma.WebsiteWhereInput {
  const where: Prisma.WebsiteWhereInput = role === "MANAGER" ? {} : { clientId: userId };

  if (filters.status) where.status = filters.status as WebsiteStatus;

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
      { name: { contains: filters.search, mode: "insensitive" } },
      { url: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}

function buildOrderBy(
  sortBy: WebsiteSortField,
  sortOrder: SortOrder,
): Prisma.WebsiteOrderByWithRelationInput {
  return { [sortBy]: sortOrder };
}

export class WebsiteRepository {
  async findMany(userId: string, role: Role, query: ListWebsitesQuery) {
    const where = buildWhere(userId, role, query);
    const skip = (query.page - 1) * query.pageSize;
    const orderBy = buildOrderBy(query.sortBy, query.sortOrder);
    const include: Prisma.WebsiteInclude =
      role === "MANAGER"
        ? {
            client: { select: { id: true, name: true } },
            _count: { select: { issues: { where: openIssuesFilter } } },
          }
        : {
            _count: { select: { issues: { where: openIssuesFilter } } },
          };

    const [items, total] = await Promise.all([
      prisma.website.findMany({
        where,
        include,
        orderBy,
        skip,
        take: query.pageSize,
      }),
      prisma.website.count({ where }),
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

  findOptions(userId: string, role: Role) {
    return prisma.website.findMany({
      where: role === "MANAGER" ? {} : { clientId: userId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  }

  findById(id: string) {
    return prisma.website.findUnique({ where: { id } });
  }
}

export const websiteRepository = new WebsiteRepository();
