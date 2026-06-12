import { IssueCategory, IssueSeverity, IssueStatus } from "@prisma/client";

export interface CreateIssueInput {
  title: string;
  description: string;
  websiteId: string;
  category: IssueCategory;
  severity?: IssueSeverity;
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  category?: IssueCategory;
  severity?: IssueSeverity;
  status?: IssueStatus;
  assigneeId?: string | null;
}
