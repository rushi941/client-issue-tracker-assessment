import { DEFAULT_PAGE_SIZE } from "./issue-list-params";

export type WebsiteSortOption =
  | "created-desc"
  | "created-asc"
  | "updated-desc"
  | "name-asc"
  | "name-desc"
  | "status-asc"
  | "lastChecked-desc";

export { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "./issue-list-params";
export type { PageSizeOption } from "./issue-list-params";

export function sortOptionToQuery(sort: WebsiteSortOption): { sortBy: string; sortOrder: string } {
  switch (sort) {
    case "created-asc":
      return { sortBy: "createdAt", sortOrder: "asc" };
    case "updated-desc":
      return { sortBy: "updatedAt", sortOrder: "desc" };
    case "name-asc":
      return { sortBy: "name", sortOrder: "asc" };
    case "name-desc":
      return { sortBy: "name", sortOrder: "desc" };
    case "status-asc":
      return { sortBy: "status", sortOrder: "asc" };
    case "lastChecked-desc":
      return { sortBy: "lastCheckedAt", sortOrder: "desc" };
    case "created-desc":
    default:
      return { sortBy: "createdAt", sortOrder: "desc" };
  }
}

export function buildWebsitesQueryParams(options: {
  page: number;
  pageSize?: number;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: WebsiteSortOption;
}): string {
  const params = new URLSearchParams();
  params.set("page", String(options.page));
  params.set("pageSize", String(options.pageSize ?? DEFAULT_PAGE_SIZE));

  const { sortBy, sortOrder } = sortOptionToQuery(options.sort ?? "created-desc");
  params.set("sortBy", sortBy);
  params.set("sortOrder", sortOrder);

  if (options.search?.trim()) params.set("search", options.search.trim());
  if (options.status && options.status !== "ALL") params.set("status", options.status);
  if (options.dateFrom) params.set("createdFrom", options.dateFrom);
  if (options.dateTo) params.set("createdTo", options.dateTo);

  return params.toString();
}
