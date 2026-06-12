import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { websiteController } from "../controllers/website.controller";
import { issueController } from "../controllers/issue.controller";
import { notificationController } from "../controllers/notification.controller";
import { analyticsController, aiController } from "../controllers/analytics.controller";
import { attachmentController } from "../controllers/attachment.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import {
  loginSchema,
  createIssueSchema,
  clientUpdateIssueSchema,
  managerUpdateIssueSchema,
  commentSchema,
  aiSuggestSchema,
} from "../validators/schemas";

const router = Router();

router.post("/auth/login", validateBody(loginSchema), authController.login.bind(authController));
router.post("/auth/logout", authController.logout.bind(authController));
router.get("/auth/me", authenticate, authController.me.bind(authController));

router.get("/websites", authenticate, websiteController.list.bind(websiteController));
router.get("/websites/options", authenticate, websiteController.options.bind(websiteController));

router.get("/issues", authenticate, issueController.list.bind(issueController));
router.get(
  "/issues/managers",
  authenticate,
  requireRole("MANAGER"),
  issueController.managers.bind(issueController),
);
router.post(
  "/issues",
  authenticate,
  requireRole("CLIENT"),
  validateBody(createIssueSchema),
  issueController.create.bind(issueController),
);
router.get("/issues/:id", authenticate, issueController.getById.bind(issueController));
router.get("/issues/:id/timeline", authenticate, issueController.timeline.bind(issueController));
router.get(
  "/issues/:id/attachments",
  authenticate,
  attachmentController.list.bind(attachmentController),
);
router.post(
  "/issues/:id/attachments",
  authenticate,
  attachmentController.upload.bind(attachmentController),
);

router.patch(
  "/issues/:id",
  authenticate,
  requireRole("CLIENT"),
  validateBody(clientUpdateIssueSchema),
  issueController.updateByClient.bind(issueController),
);
router.patch(
  "/issues/:id/manage",
  authenticate,
  requireRole("MANAGER"),
  validateBody(managerUpdateIssueSchema),
  issueController.updateByManager.bind(issueController),
);
router.post(
  "/issues/:id/comments",
  authenticate,
  requireRole("CLIENT"),
  validateBody(commentSchema),
  issueController.addClientComment.bind(issueController),
);
router.post(
  "/issues/:id/responses",
  authenticate,
  requireRole("MANAGER"),
  validateBody(commentSchema),
  issueController.addManagerResponse.bind(issueController),
);

router.get(
  "/notifications",
  authenticate,
  notificationController.list.bind(notificationController),
);
router.patch(
  "/notifications/:id/read",
  authenticate,
  notificationController.markRead.bind(notificationController),
);
router.patch(
  "/notifications/read-all",
  authenticate,
  notificationController.markAllRead.bind(notificationController),
);

router.get(
  "/analytics/dashboard",
  authenticate,
  requireRole("MANAGER"),
  analyticsController.dashboard.bind(analyticsController),
);

router.post(
  "/ai/suggest",
  authenticate,
  requireRole("CLIENT"),
  validateBody(aiSuggestSchema),
  aiController.suggest.bind(aiController),
);
router.get("/ai/issues/:id/summary", authenticate, aiController.summarize.bind(aiController));
router.get(
  "/ai/issues/:id/suggest-response",
  authenticate,
  requireRole("MANAGER"),
  aiController.suggestResponse.bind(aiController),
);

export default router;
