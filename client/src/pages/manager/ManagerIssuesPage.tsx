import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, ListTodo } from "lucide-react";
import { api } from "@/api/client";
import { Issue, PaginatedResponse } from "@/types";
import { ActiveFilterChips, FilterChip } from "@/components/list/active-filter-chips";
import { ListPaginationFooter } from "@/components/list/list-pagination-footer";
import { ListSearchBar } from "@/components/list/list-search-bar";
import { Card, CardContent } from "@/components/ui/card";
import { SeverityBadge, IssueStatusBadge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { QueryErrorBanner } from "@/components/ui/query-error";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_PAGE_SIZE, buildIssuesQueryParams } from "@/lib/issue-list-params";

export function ManagerIssuesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["issues", "manager", search, page, pageSize],
    queryFn: () => {
      const q = buildIssuesQueryParams({ page, pageSize, search });
      return api<PaginatedResponse<Issue>>(`/api/issues?${q}`);
    },
    retry: 1,
    placeholderData: (previous) => previous,
  });

  const issues = data?.items ?? [];
  const pagination = data?.pagination;
  const total = pagination?.total ?? 0;

  const filterChips = useMemo((): FilterChip[] => {
    if (!search.trim()) return [];
    return [
      {
        key: "search",
        label: `Search: "${search.trim()}"`,
        tone: "accent",
        onRemove: () => setSearch(""),
      },
    ];
  }, [search]);

  if (isError) {
    return <QueryErrorBanner error={error} onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-secondary">
              <ListTodo className="h-4 w-4" />
              Issue Queue
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">All reported issues</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review, assign, and resolve issues from every client.
            </p>
          </div>
          {!isLoading && (
            <Badge variant="outline" className="px-3 py-1 text-sm">
              {total} total
            </Badge>
          )}
        </div>
      </div>

      <div className="list-toolbar rounded-xl p-3 sm:p-4">
        <ListSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by title, client, or website..."
        />
      </div>

      <ActiveFilterChips chips={filterChips} onClearAll={search ? () => setSearch("") : undefined} />

      {isLoading ? (
        <Loader label="Loading issue queue..." />
      ) : issues.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No issues found{search ? " for your search" : ""}.
          </CardContent>
        </Card>
      ) : (
        <div className="relative space-y-3">
          {isFetching ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-[1px]">
              <Loader size="sm" className="py-0" />
            </div>
          ) : null}
          {issues.map((issue) => (
            <Link key={issue.id} to={`/manager/issues/${issue.id}`} className="group block">
              <Card className="transition-all duration-200 hover:border-accent/40 hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold group-hover:text-primary">{issue.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {issue.createdBy?.name} · {issue.website?.name}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <SeverityBadge severity={issue.severity} />
                    <IssueStatusBadge status={issue.status} />
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && pagination ? (
        <ListPaginationFooter
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          disabled={isFetching}
        />
      ) : null}
    </div>
  );
}
