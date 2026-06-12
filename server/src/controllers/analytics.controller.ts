import { Response, NextFunction } from "express";
import { analyticsService, aiService } from "../services/notification.service";
import { issueService } from "../services/issue.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { paramId } from "../utils/params";

export class AnalyticsController {
  async dashboard(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getDashboardMetrics();
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }
}

export class AiController {
  async suggest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, description } = req.body;
      const data = aiService.suggestCategoryAndSeverity(title, description);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }

  async summarize(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const issue = await issueService.getById(
        paramId(req.params.id),
        req.user!.userId,
        req.user!.role,
      );
      const data = aiService.summarizeIssue(issue.title, issue.description);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }

  async suggestResponse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const issue = await issueService.getById(
        paramId(req.params.id),
        req.user!.userId,
        req.user!.role,
      );
      const data = aiService.suggestManagerResponse(issue.title, issue.description, issue.status);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }
}

export const analyticsController = new AnalyticsController();
export const aiController = new AiController();
