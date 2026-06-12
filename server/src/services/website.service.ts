import { Role } from "@prisma/client";
import { websiteRepository } from "../repositories/website.repository";
import { ListWebsitesQuery } from "../types/pagination.types";

export class WebsiteService {
  async listForUser(userId: string, role: Role, query: ListWebsitesQuery) {
    const result = await websiteRepository.findMany(userId, role, query);

    return {
      items: result.items.map((w) => ({
        id: w.id,
        name: w.name,
        url: w.url,
        status: w.status,
        lastCheckedAt: w.lastCheckedAt,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
        openIssuesCount: w._count.issues,
        ...( "client" in w && w.client ? { client: w.client } : {}),
      })),
      pagination: result.pagination,
    };
  }

  async listOptions(userId: string, role: Role) {
    return websiteRepository.findOptions(userId, role);
  }
}

export const websiteService = new WebsiteService();
