import { Response, NextFunction } from "express";
import { IssueSeverity, IssueStatus } from "@prisma/client";
import { issueService } from "../services/issue.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { userRepository } from "../repositories/user.repository";
import { paramId } from "../utils/params";
import { IssueSortField, ListIssuesQuery, SortOrder } from "../types/pagination.types";

const VALID_SORT_FIELDS: IssueSortField[] = ["createdAt", "updatedAt", "title", "severity"];
const VALID_SORT_ORDERS: SortOrder[] = ["asc", "desc"];
const VALID_PAGE_SIZES = [5, 10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = 5;

function parseListQuery(req: AuthRequest): ListIssuesQuery {
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
  const pageSizeRaw = parseInt(String(req.query.pageSize ?? String(DEFAULT_PAGE_SIZE)), 10);
  const pageSize = VALID_PAGE_SIZES.includes(pageSizeRaw as (typeof VALID_PAGE_SIZES)[number])
    ? pageSizeRaw
    : DEFAULT_PAGE_SIZE;

  const sortByRaw = String(req.query.sortBy ?? "createdAt");
  const sortBy = VALID_SORT_FIELDS.includes(sortByRaw as IssueSortField)
    ? (sortByRaw as IssueSortField)
    : "createdAt";

  const sortOrderRaw = String(req.query.sortOrder ?? "desc");
  const sortOrder = VALID_SORT_ORDERS.includes(sortOrderRaw as SortOrder)
    ? (sortOrderRaw as SortOrder)
    : "desc";

  const statusRaw = req.query.status as string | undefined;
  const status =
    statusRaw && Object.values(IssueStatus).includes(statusRaw as IssueStatus)
      ? (statusRaw as IssueStatus)
      : undefined;

  const severityRaw = req.query.severity as string | undefined;
  const severity =
    severityRaw && Object.values(IssueSeverity).includes(severityRaw as IssueSeverity)
      ? (severityRaw as IssueSeverity)
      : undefined;

  return {
    page,
    pageSize,
    sortBy,
    sortOrder,
    status,
    severity,
    search: req.query.search ? String(req.query.search) : undefined,
    createdFrom: req.query.createdFrom ? String(req.query.createdFrom) : undefined,
    createdTo: req.query.createdTo ? String(req.query.createdTo) : undefined,
  };
}

export class IssueController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = parseListQuery(req);
      const data = await issueService.list(req.user!.userId, req.user!.role, query);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await issueService.getById(
        paramId(req.params.id),
        req.user!.userId,
        req.user!.role,
      );
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await issueService.create(req.user!.userId, req.body);
      res.status(201).json({ data });
    } catch (err) {
      next(err);
    }
  }

  async updateByClient(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await issueService.updateByClient(
        paramId(req.params.id),
        req.user!.userId,
        req.body,
      );
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }

  async updateByManager(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await issueService.updateByManager(
        paramId(req.params.id),
        req.user!.userId,
        req.body,
      );
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }

  async addClientComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { body } = req.body;
      const data = await issueService.addClientComment(
        paramId(req.params.id),
        req.user!.userId,
        body,
      );
      res.status(201).json({ data });
    } catch (err) {
      next(err);
    }
  }

  async addManagerResponse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { body } = req.body;
      const data = await issueService.addManagerResponse(
        paramId(req.params.id),
        req.user!.userId,
        body,
      );
      res.status(201).json({ data });
    } catch (err) {
      next(err);
    }
  }

  async timeline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await issueService.getTimeline(
        paramId(req.params.id),
        req.user!.userId,
        req.user!.role,
      );
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }

  async managers(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await userRepository.findManagers();
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }
}

export const issueController = new IssueController();
