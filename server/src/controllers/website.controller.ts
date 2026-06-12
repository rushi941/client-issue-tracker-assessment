import { Response, NextFunction } from "express";
import { WebsiteStatus } from "@prisma/client";
import { websiteService } from "../services/website.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { ListWebsitesQuery, SortOrder, WebsiteSortField } from "../types/pagination.types";

const VALID_SORT_FIELDS: WebsiteSortField[] = [
  "createdAt",
  "updatedAt",
  "name",
  "status",
  "lastCheckedAt",
];
const VALID_SORT_ORDERS: SortOrder[] = ["asc", "desc"];
const VALID_PAGE_SIZES = [5, 10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = 5;

function parseListQuery(req: AuthRequest): ListWebsitesQuery {
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
  const pageSizeRaw = parseInt(String(req.query.pageSize ?? String(DEFAULT_PAGE_SIZE)), 10);
  const pageSize = VALID_PAGE_SIZES.includes(pageSizeRaw as (typeof VALID_PAGE_SIZES)[number])
    ? pageSizeRaw
    : DEFAULT_PAGE_SIZE;

  const sortByRaw = String(req.query.sortBy ?? "createdAt");
  const sortBy = VALID_SORT_FIELDS.includes(sortByRaw as WebsiteSortField)
    ? (sortByRaw as WebsiteSortField)
    : "createdAt";

  const sortOrderRaw = String(req.query.sortOrder ?? "desc");
  const sortOrder = VALID_SORT_ORDERS.includes(sortOrderRaw as SortOrder)
    ? (sortOrderRaw as SortOrder)
    : "desc";

  const statusRaw = req.query.status as string | undefined;
  const status =
    statusRaw && Object.values(WebsiteStatus).includes(statusRaw as WebsiteStatus)
      ? statusRaw
      : undefined;

  return {
    page,
    pageSize,
    sortBy,
    sortOrder,
    status,
    search: req.query.search ? String(req.query.search) : undefined,
    createdFrom: req.query.createdFrom ? String(req.query.createdFrom) : undefined,
    createdTo: req.query.createdTo ? String(req.query.createdTo) : undefined,
  };
}

export class WebsiteController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = parseListQuery(req);
      const data = await websiteService.listForUser(req.user!.userId, req.user!.role, query);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }

  async options(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await websiteService.listOptions(req.user!.userId, req.user!.role);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }
}

export const websiteController = new WebsiteController();
