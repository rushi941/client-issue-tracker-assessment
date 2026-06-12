/** Human-readable labels matching assessment spec */

export const WEBSITE_STATUS_LABELS: Record<string, string> = {
  ONLINE: "Online",
  DOWN: "Down",
  DEGRADED: "Degraded",
  UNKNOWN: "Unknown",
};

export const ISSUE_CATEGORY_LABELS: Record<string, string> = {
  BUG: "Bug",
  FEEDBACK: "Feedback",
  SUGGESTION: "Suggestion",
  IMPROVEMENT: "Improvement",
};

export const ISSUE_SEVERITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const ISSUE_STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  IN_REVIEW: "In Review",
  IN_PROGRESS: "In Progress",
  WAITING_FOR_CLIENT: "Waiting for Client",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  CREATED: "Issue Created",
  UPDATED: "Issue Updated",
  ASSIGNED: "Assigned",
  STATUS_CHANGED: "Status Updated",
  SEVERITY_CHANGED: "Severity Updated",
  COMMENT: "Comment",
  RESPONSE: "Manager Response",
  RESOLVED: "Resolved",
};

export function formatActivityType(type: string): string {
  return ACTIVITY_TYPE_LABELS[type] ?? type.replace(/_/g, " ");
}

export function formatWebsiteStatus(status: string): string {
  return WEBSITE_STATUS_LABELS[status] ?? status;
}

export function formatIssueCategory(category: string): string {
  return ISSUE_CATEGORY_LABELS[category] ?? category;
}

export function formatIssueSeverity(severity: string): string {
  return ISSUE_SEVERITY_LABELS[severity] ?? severity;
}

export function formatIssueStatus(status: string): string {
  return ISSUE_STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

export const ISSUE_CATEGORIES = Object.keys(ISSUE_CATEGORY_LABELS) as Array<
  keyof typeof ISSUE_CATEGORY_LABELS
>;

export const ISSUE_SEVERITIES = Object.keys(ISSUE_SEVERITY_LABELS) as Array<
  keyof typeof ISSUE_SEVERITY_LABELS
>;

export const ISSUE_STATUSES = Object.keys(ISSUE_STATUS_LABELS) as Array<
  keyof typeof ISSUE_STATUS_LABELS
>;

export const WEBSITE_STATUSES = Object.keys(WEBSITE_STATUS_LABELS) as Array<
  keyof typeof WEBSITE_STATUS_LABELS
>;
