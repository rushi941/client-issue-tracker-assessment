export type IssueSortOption =
  | "created-desc"
  | "created-asc"
  | "updated-desc"
  | "title-asc"
  | "severity-desc";

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];
export const DEFAULT_PAGE_SIZE: PageSizeOption = 5;

export function sortOptionToQuery(sort: IssueSortOption): { sortBy: string; sortOrder: string } {
  switch (sort) {
    case "created-asc":
      return { sortBy: "createdAt", sortOrder: "asc" };
    case "updated-desc":
      return { sortBy: "updatedAt", sortOrder: "desc" };
    case "title-asc":
      return { sortBy: "title", sortOrder: "asc" };
    case "severity-desc":
      return { sortBy: "severity", sortOrder: "desc" };
    case "created-desc":
    default:
      return { sortBy: "createdAt", sortOrder: "desc" };
  }
}

export function buildIssuesQueryParams(options: {
  page: number;
  pageSize?: number;
  search?: string;
  status?: string;
  severity?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: IssueSortOption;
}): string {
  const params = new URLSearchParams();
  params.set("page", String(options.page));
  params.set("pageSize", String(options.pageSize ?? DEFAULT_PAGE_SIZE));

  const { sortBy, sortOrder } = sortOptionToQuery(options.sort ?? "created-desc");
  params.set("sortBy", sortBy);
  params.set("sortOrder", sortOrder);

  if (options.search?.trim()) params.set("search", options.search.trim());
  if (options.status && options.status !== "ALL") params.set("status", options.status);
  if (options.severity && options.severity !== "ALL") params.set("severity", options.severity);
  if (options.dateFrom) params.set("createdFrom", options.dateFrom);
  if (options.dateTo) params.set("createdTo", options.dateTo);

  return params.toString();
}
