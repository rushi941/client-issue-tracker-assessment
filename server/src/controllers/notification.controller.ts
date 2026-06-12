import { Response, NextFunction } from "express";
import { notificationService } from "../services/notification.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { paramId } from "../utils/params";

export class NotificationController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const [notifications, unreadCount] = await Promise.all([
        notificationService.list(req.user!.userId),
        notificationService.unreadCount(req.user!.userId),
      ]);
      res.json({ data: { notifications, unreadCount } });
    } catch (err) {
      next(err);
    }
  }

  async markRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markRead(paramId(req.params.id), req.user!.userId);
      res.json({ data: { message: "Marked as read" } });
    } catch (err) {
      next(err);
    }
  }

  async markAllRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllRead(req.user!.userId);
      res.json({ data: { message: "All marked as read" } });
    } catch (err) {
      next(err);
    }
  }
}

export const notificationController = new NotificationController();
