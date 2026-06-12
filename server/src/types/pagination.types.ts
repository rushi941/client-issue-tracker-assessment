export type IssueSortField = "createdAt" | "updatedAt" | "title" | "severity";
export type SortOrder = "asc" | "desc";

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ListIssuesQuery {
  status?: string;
  search?: string;
  severity?: string;
  createdFrom?: string;
  createdTo?: string;
  page: number;
  pageSize: number;
  sortBy: IssueSortField;
  sortOrder: SortOrder;
}

export type WebsiteSortField = "createdAt" | "updatedAt" | "name" | "status" | "lastCheckedAt";

export interface ListWebsitesQuery {
  status?: string;
  search?: string;
  createdFrom?: string;
  createdTo?: string;
  page: number;
  pageSize: number;
  sortBy: WebsiteSortField;
  sortOrder: SortOrder;
}
