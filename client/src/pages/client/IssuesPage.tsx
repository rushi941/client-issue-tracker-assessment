import { Calendar, ChevronRight, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Issue, PaginatedResponse } from "@/types";
import { ActiveFilterChips, FilterChip } from "@/components/list/active-filter-chips";
import { ListFilterPanel } from "@/components/list/list-filter-panel";
import { ListPaginationFooter } from "@/components/list/list-pagination-footer";
import { ListToolbar } from "@/components/list/list-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { SeverityBadge, IssueStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { QueryErrorBanner } from "@/components/ui/query-error";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ISSUE_SEVERITIES,
  ISSUE_STATUSES,
  formatIssueSeverity,
  formatIssueStatus,
} from "@/lib/labels";
import {
  DEFAULT_PAGE_SIZE,
  IssueSortOption,
  buildIssuesQueryParams,
} from "@/lib/issue-list-params";

const SORT_OPTIONS: { value: IssueSortOption; label: string }[] = [
  { value: "created-desc", label: "Newest created" },
  { value: "created-asc", label: "Oldest created" },
  { value: "updated-desc", label: "Recently updated" },
  { value: "title-asc", label: "Title (A–Z)" },
  { value: "severity-desc", label: "Severity (highest first)" },
];

function formatIssueDate(iso: string) {
  const date = new Date(iso);
  const full = date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const relative = formatRelativeTime(date);
  return { full, relative };
}

function formatRelativeTime(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

function IssueMetaDates({ issue }: { issue: Issue }) {
  const created = formatIssueDate(issue.createdAt);
  const updated = formatIssueDate(issue.updatedAt);

  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <Calendar className="h-3 w-3 shrink-0" />
        Created {created.full}
        <span className="text-muted-foreground/60">({created.relative})</span>
      </span>
      {issue.updatedAt !== issue.createdAt && <span>Updated {updated.relative}</span>}
      {issue.resolvedAt && (
        <span className="text-success">
          Resolved {formatIssueDate(issue.resolvedAt).full}
        </span>
      )}
    </div>
  );
}

export function IssuesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<IssueSortOption>("created-desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, severityFilter, dateFrom, dateTo, sortBy, pageSize]);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["issues", search, statusFilter, severityFilter, dateFrom, dateTo, sortBy, page, pageSize],
    queryFn: () => {
      const q = buildIssuesQueryParams({
        page,
        pageSize,
        search,
        status: statusFilter,
        severity: severityFilter,
        dateFrom,
        dateTo,
        sort: sortBy,
      });
      return api<PaginatedResponse<Issue>>(`/api/issues?${q}`);
    },
    retry: 1,
    placeholderData: (previous) => previous,
  });

  const issues = data?.items ?? [];
  const pagination = data?.pagination;
  const total = pagination?.total ?? 0;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setSeverityFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setSortBy("created-desc");
    setPage(1);
  };

  const hasActiveFilters =
    search ||
    statusFilter !== "ALL" ||
    severityFilter !== "ALL" ||
    dateFrom ||
    dateTo ||
    sortBy !== "created-desc";

  const activeFilterCount = [
    statusFilter !== "ALL",
    severityFilter !== "ALL",
    dateFrom,
    dateTo,
  ].filter(Boolean).length;

  const filterChips = useMemo((): FilterChip[] => {
    const chips: FilterChip[] = [];
    if (search.trim()) {
      chips.push({
        key: "search",
        label: `Search: "${search.trim()}"`,
        tone: "accent",
        onRemove: () => setSearch(""),
      });
    }
    if (statusFilter !== "ALL") {
      chips.push({
        key: "status",
        label: formatIssueStatus(statusFilter),
        tone: "secondary",
        onRemove: () => setStatusFilter("ALL"),
      });
    }
    if (severityFilter !== "ALL") {
      chips.push({
        key: "severity",
        label: formatIssueSeverity(severityFilter),
        tone: "secondary",
        onRemove: () => setSeverityFilter("ALL"),
      });
    }
    if (dateFrom) {
      chips.push({ key: "from", label: `From ${dateFrom}`, onRemove: () => setDateFrom("") });
    }
    if (dateTo) {
      chips.push({ key: "to", label: `To ${dateTo}`, onRemove: () => setDateTo("") });
    }
    if (sortBy !== "created-desc") {
      chips.push({
        key: "sort",
        label: SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Custom sort",
        tone: "accent",
        onRemove: () => setSortBy("created-desc"),
      });
    }
    return chips;
  }, [search, statusFilter, severityFilter, dateFrom, dateTo, sortBy]);

  if (isError) {
    return <QueryErrorBanner error={error} onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-secondary">
            <Ticket className="h-4 w-4" />
            My Issues
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Track progress, filter by status, and sort by date or priority.
          </p>
        </div>
        <Button variant="secondary" asChild>
          <Link to="/issues/new">New Issue</Link>
        </Button>
      </div>

      <Card className="overflow-hidden shadow-sm">
        <CardContent className="space-y-1 pt-6">
          <ListToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by title or description..."
            sortValue={sortBy}
            onSortChange={(v) => setSortBy(v as IssueSortOption)}
            sortOptions={SORT_OPTIONS}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters((v) => !v)}
            activeFilterCount={activeFilterCount}
          />

          <ListFilterPanel open={showFilters} columns={4}>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-dashed bg-background/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  {ISSUE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {formatIssueStatus(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Severity
              </Label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="border-dashed bg-background/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All severities</SelectItem>
                  {ISSUE_SEVERITIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {formatIssueSeverity(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Created from
              </Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border-dashed bg-background/80"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Created to
              </Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border-dashed bg-background/80"
              />
            </div>
          </ListFilterPanel>

          <ActiveFilterChips chips={filterChips} onClearAll={hasActiveFilters ? clearFilters : undefined} />
        </CardContent>
      </Card>

      {isLoading ? (
        <Loader label="Loading your issues..." />
      ) : issues.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {total === 0 && !hasActiveFilters
              ? "No issues yet. Report your first issue."
              : "No issues match your filters. Try adjusting search or dates."}
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
            <Link key={issue.id} to={`/issues/${issue.id}`} className="group block">
              <Card className="transition-all duration-200 hover:border-accent/40 hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold group-hover:text-primary">{issue.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {issue.description}
                      </p>
                      <p className="mt-2 text-xs font-medium text-muted-foreground/80">
                        {issue.website?.name}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <SeverityBadge severity={issue.severity} />
                      <IssueStatusBadge status={issue.status} />
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </div>
                  <IssueMetaDates issue={issue} />
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
