import { Response, NextFunction } from "express";
import { attachmentService } from "../services/attachment.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { paramId } from "../utils/params";

export class AttachmentController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await attachmentService.listForIssue(
        paramId(req.params.id),
        req.user!.userId,
        req.user!.role,
      );
      res.json({
        data,
        meta: {
          uploadSupported: false,
          note: "File upload is a future enhancement. Use GET to list attachments when available.",
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async upload(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      attachmentService.uploadNotImplemented();
    } catch (err) {
      next(err);
    }
  }
}

export const attachmentController = new AttachmentController();
