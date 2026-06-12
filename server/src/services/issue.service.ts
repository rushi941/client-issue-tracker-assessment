import { ActivityType, IssueStatus, NotificationType, Role } from "@prisma/client";
import { issueRepository } from "../repositories/issue.repository";
import { activityRepository } from "../repositories/activity.repository";
import { notificationRepository } from "../repositories/notification.repository";
import { commentRepository } from "../repositories/comment.repository";
import { websiteRepository } from "../repositories/website.repository";
import { AppError } from "../utils/app-error";
import { CreateIssueInput, UpdateIssueInput } from "../types/issue.types";
import { ListIssuesQuery } from "../types/pagination.types";

export class IssueService {
  async list(userId: string, role: Role, query: ListIssuesQuery) {
    return issueRepository.findManyForUser(userId, role, query);
  }

  async getById(id: string, userId: string, role: Role) {
    const issue = await issueRepository.findById(id);
    if (!issue) throw new AppError(404, "Issue not found");
    if (role === "CLIENT" && issue.createdById !== userId) {
      throw new AppError(403, "Access denied");
    }
    return issue;
  }

  async create(userId: string, input: CreateIssueInput) {
    const website = await websiteRepository.findById(input.websiteId);
    if (!website) throw new AppError(404, "Website not found");
    if (website.clientId !== userId) {
      throw new AppError(403, "Website not assigned to you");
    }

    const issue = await issueRepository.create({
      title: input.title,
      description: input.description,
      category: input.category,
      severity: input.severity ?? "MEDIUM",
      website: { connect: { id: input.websiteId } },
      createdBy: { connect: { id: userId } },
    });

    await activityRepository.create({
      issueId: issue.id,
      actorId: userId,
      type: ActivityType.CREATED,
      message: `Issue created: ${issue.title}`,
    });

    return issue;
  }

  async updateByClient(id: string, userId: string, input: UpdateIssueInput) {
    return this.update(id, userId, "CLIENT", input);
  }

  async updateByManager(id: string, userId: string, input: UpdateIssueInput) {
    return this.update(id, userId, "MANAGER", input);
  }

  private async update(id: string, userId: string, role: Role, input: UpdateIssueInput) {
    const existing = await this.getById(id, userId, role);

    if (role === "CLIENT") {
      if (input.status || input.assigneeId !== undefined || input.severity) {
        throw new AppError(403, "Clients cannot update status, severity, or assignment");
      }
    }

    const updates: UpdateIssueInput & { resolvedAt?: Date | null } = { ...input };
    const activities: Array<{ type: ActivityType; message: string; metadata?: object }> = [];

    if (input.status && input.status !== existing.status) {
      activities.push({
        type: input.status === "RESOLVED" ? ActivityType.RESOLVED : ActivityType.STATUS_CHANGED,
        message: `Status changed from ${existing.status} to ${input.status}`,
        metadata: { from: existing.status, to: input.status },
      });
      if (input.status === "RESOLVED" || input.status === "CLOSED") {
        updates.resolvedAt = new Date();
      }
    }

    if (input.severity && input.severity !== existing.severity) {
      activities.push({
        type: ActivityType.SEVERITY_CHANGED,
        message: `Severity changed from ${existing.severity} to ${input.severity}`,
        metadata: { from: existing.severity, to: input.severity },
      });
    }

    if (input.assigneeId !== undefined && input.assigneeId !== existing.assigneeId) {
      activities.push({
        type: ActivityType.ASSIGNED,
        message: input.assigneeId ? `Issue assigned to manager` : `Issue unassigned`,
        metadata: { assigneeId: input.assigneeId },
      });
    }

    if (input.title || input.description || input.category) {
      activities.push({
        type: ActivityType.UPDATED,
        message: "Issue details updated",
      });
    }

    const { assigneeId, ...rest } = updates;

    const issue = await issueRepository.update(id, {
      ...rest,
      assignee: assigneeId
        ? { connect: { id: assigneeId } }
        : assigneeId === null
          ? { disconnect: true }
          : undefined,
    });

    for (const activity of activities) {
      await activityRepository.create({
        issueId: id,
        actorId: userId,
        ...activity,
      });
    }

    if (input.status === "RESOLVED" && existing.createdById) {
      await notificationRepository.create({
        userId: existing.createdById,
        type: NotificationType.ISSUE_RESOLVED,
        message: `Your issue "${existing.title}" has been resolved`,
        issueId: id,
      });
    }

    if (input.assigneeId && input.assigneeId !== existing.assigneeId) {
      await notificationRepository.create({
        userId: input.assigneeId,
        type: NotificationType.ISSUE_ASSIGNED,
        message: `You were assigned issue: ${existing.title}`,
        issueId: id,
      });
    }

    return issue;
  }

  async addClientComment(issueId: string, userId: string, body: string) {
    await this.getById(issueId, userId, "CLIENT");

    const comment = await commentRepository.create({
      issueId,
      authorId: userId,
      body,
      isManagerResponse: false,
    });

    await activityRepository.create({
      issueId,
      actorId: userId,
      type: ActivityType.COMMENT,
      message: "Comment added",
      metadata: { commentId: comment.id },
    });

    return comment;
  }

  async addManagerResponse(issueId: string, userId: string, body: string) {
    await this.getById(issueId, userId, "MANAGER");

    const comment = await commentRepository.create({
      issueId,
      authorId: userId,
      body,
      isManagerResponse: true,
    });

    await activityRepository.create({
      issueId,
      actorId: userId,
      type: ActivityType.RESPONSE,
      message: "Manager responded",
      metadata: { commentId: comment.id },
    });

    const issue = await issueRepository.findById(issueId);
    if (issue && issue.createdById !== userId) {
      await notificationRepository.create({
        userId: issue.createdById,
        type: NotificationType.ISSUE_COMMENT,
        message: `New response on: ${issue.title}`,
        issueId,
      });
    }

    return comment;
  }

  async getTimeline(issueId: string, userId: string, role: Role) {
    await this.getById(issueId, userId, role);
    return activityRepository.findByIssueId(issueId);
  }
}

export const issueService = new IssueService();
