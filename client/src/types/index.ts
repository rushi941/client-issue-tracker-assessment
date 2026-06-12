export type Role = "CLIENT" | "MANAGER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Website {
  id: string;
  name: string;
  url: string;
  status: "ONLINE" | "DOWN" | "DEGRADED" | "UNKNOWN";
  lastCheckedAt: string;
  createdAt: string;
  updatedAt: string;
  openIssuesCount: number;
  client?: { id: string; name: string };
}

export interface WebsiteOption {
  id: string;
  name: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  websiteId: string;
  createdById: string;
  assigneeId?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  website?: { id: string; name: string; url?: string };
  createdBy?: { id: string; name: string; email: string };
  assignee?: { id: string; name: string; email: string } | null;
  comments?: Comment[];
  _count?: { comments: number };
}

export interface Comment {
  id: string;
  body: string;
  isManagerResponse: boolean;
  createdAt: string;
  author: { id: string; name: string; role: Role };
}

export interface ActivityLog {
  id: string;
  type: string;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  actor: { id: string; name: string; role: Role };
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  readAt?: string | null;
  createdAt: string;
  issue?: { id: string; title: string; status: string };
}

export interface Analytics {
  openIssues: number;
  resolvedIssues: number;
  criticalIssues: number;
  averageResolutionHours: number;
  issuesByStatus: Record<string, number>;
  issuesBySeverity: Record<string, number>;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}
