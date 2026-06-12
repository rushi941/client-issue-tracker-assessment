import { IssueCategory, IssueSeverity } from "@prisma/client";
import { notificationRepository } from "../repositories/notification.repository";

export class NotificationService {
  list(userId: string) {
    return notificationRepository.findByUserId(userId);
  }

  unreadCount(userId: string) {
    return notificationRepository.countUnread(userId);
  }

  markRead(id: string, userId: string) {
    return notificationRepository.markRead(id, userId);
  }

  markAllRead(userId: string) {
    return notificationRepository.markAllRead(userId);
  }
}

export const notificationService = new NotificationService();

export class AnalyticsService {
  async getDashboardMetrics() {
    const issues = await import("../repositories/issue.repository").then((m) =>
      m.issueRepository.getAnalytics(),
    );

    const openStatuses = ["OPEN", "IN_REVIEW", "IN_PROGRESS", "WAITING_FOR_CLIENT"];
    const openIssues = issues.filter((i) => openStatuses.includes(i.status)).length;
    const resolvedIssues = issues.filter((i) => ["RESOLVED", "CLOSED"].includes(i.status)).length;
    const criticalIssues = issues.filter(
      (i) => i.severity === "CRITICAL" && openStatuses.includes(i.status),
    ).length;

    const resolvedWithTime = issues.filter((i) => i.resolvedAt);
    const avgResolutionHours =
      resolvedWithTime.length > 0
        ? resolvedWithTime.reduce((sum, i) => {
            const ms = i.resolvedAt!.getTime() - i.createdAt.getTime();
            return sum + ms / (1000 * 60 * 60);
          }, 0) / resolvedWithTime.length
        : 0;

    const byStatus = issues.reduce<Record<string, number>>((acc, i) => {
      acc[i.status] = (acc[i.status] ?? 0) + 1;
      return acc;
    }, {});

    const bySeverity = issues.reduce<Record<string, number>>((acc, i) => {
      acc[i.severity] = (acc[i.severity] ?? 0) + 1;
      return acc;
    }, {});

    return {
      openIssues,
      resolvedIssues,
      criticalIssues,
      averageResolutionHours: Math.round(avgResolutionHours * 10) / 10,
      issuesByStatus: byStatus,
      issuesBySeverity: bySeverity,
    };
  }
}

export const analyticsService = new AnalyticsService();

export class AiService {
  suggestCategoryAndSeverity(title: string, description: string) {
    const text = `${title} ${description}`.toLowerCase();
    let category: IssueCategory = "BUG";
    let severity: IssueSeverity = "MEDIUM";

    if (/suggest|improve|enhancement|feature/.test(text)) category = "SUGGESTION";
    else if (/feedback|review|opinion/.test(text)) category = "FEEDBACK";
    else if (/improve|optimize|performance/.test(text)) category = "IMPROVEMENT";

    if (/critical|urgent|down|broken|crash|security/.test(text)) severity = "CRITICAL";
    else if (/high|important|error|fail/.test(text)) severity = "HIGH";
    else if (/minor|typo|small|low/.test(text)) severity = "LOW";

    const suggestedAction =
      severity === "CRITICAL"
        ? "Escalate immediately and assign a manager"
        : category === "BUG"
          ? "Reproduce steps and check server logs"
          : "Review with client and prioritize in backlog";

    return { category, severity, suggestedAction };
  }

  summarizeIssue(title: string, description: string) {
    const sentences = description.split(/[.!?]+/).filter(Boolean);
    const summary = sentences.slice(0, 2).join(". ").trim() || description.slice(0, 120);
    return { summary: `${title}: ${summary}` };
  }

  suggestManagerResponse(title: string, description: string, status: string) {
    return {
      response: `Thank you for reporting "${title}". We have reviewed your request and ${status === "RESOLVED" ? "resolved the issue" : "are actively working on it"}. ${description.length > 100 ? "We will keep you updated on progress." : "Please let us know if you need anything else."}`,
    };
  }
}

export const aiService = new AiService();
