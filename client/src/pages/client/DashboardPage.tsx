import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ExternalLink, Globe } from "lucide-react";
import { api } from "@/api/client";
import { PaginatedResponse, Website } from "@/types";
import { ActiveFilterChips, FilterChip } from "@/components/list/active-filter-chips";
import { ListFilterPanel } from "@/components/list/list-filter-panel";
import { ListPaginationFooter } from "@/components/list/list-pagination-footer";
import { ListToolbar } from "@/components/list/list-toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
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
import { formatWebsiteStatus, WEBSITE_STATUSES } from "@/lib/labels";
import {
  DEFAULT_PAGE_SIZE,
  WebsiteSortOption,
  buildWebsitesQueryParams,
} from "@/lib/website-list-params";

const SORT_OPTIONS: { value: WebsiteSortOption; label: string }[] = [
  { value: "created-desc", label: "Newest created" },
  { value: "created-asc", label: "Oldest created" },
  { value: "updated-desc", label: "Recently updated" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "status-asc", label: "Status" },
  { value: "lastChecked-desc", label: "Last checked (newest)" },
];

function formatWebsiteDate(iso: string) {
  const date = new Date(iso);
  return {
    full: date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    relative: formatRelativeTime(date),
  };
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

function WebsiteMetaDates({ site }: { site: Website }) {
  const created = formatWebsiteDate(site.createdAt);
  const updated = formatWebsiteDate(site.updatedAt);
  const lastChecked = formatWebsiteDate(site.lastCheckedAt);

  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <Calendar className="h-3 w-3 shrink-0" />
        Added {created.full}
        <span className="text-muted-foreground/60">({created.relative})</span>
      </span>
      {site.updatedAt !== site.createdAt && <span>Updated {updated.relative}</span>}
      <span>Last checked {lastChecked.relative}</span>
    </div>
  );
}

function WebsiteCard({ site }: { site: Website }) {
  return (
    <Card className="transition-all duration-200 hover:border-accent/40 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">{site.name}</CardTitle>
          <StatusBadge status={site.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">URL</p>
          <a
            href={site.url}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 text-accent hover:underline"
          >
            {site.url}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Current Status
            </p>
            <p className="mt-0.5 font-medium">{formatWebsiteStatus(site.status)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Open Issues
            </p>
            <p className="mt-0.5 font-medium text-secondary">{site.openIssuesCount}</p>
          </div>
        </div>
        <WebsiteMetaDates site={site} />
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<WebsiteSortOption>("created-desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, dateFrom, dateTo, sortBy, pageSize]);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["websites", search, statusFilter, dateFrom, dateTo, sortBy, page, pageSize],
    queryFn: () => {
      const q = buildWebsitesQueryParams({
        page,
        pageSize,
        search,
        status: statusFilter,
        dateFrom,
        dateTo,
        sort: sortBy,
      });
      return api<PaginatedResponse<Website>>(`/api/websites?${q}`);
    },
    retry: 1,
    placeholderData: (previous) => previous,
  });

  const websites = data?.items ?? [];
  const pagination = data?.pagination;
  const total = pagination?.total ?? 0;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setSortBy("created-desc");
    setPage(1);
  };

  const hasActiveFilters =
    search || statusFilter !== "ALL" || dateFrom || dateTo || sortBy !== "created-desc";

  const activeFilterCount = [statusFilter !== "ALL", dateFrom, dateTo].filter(Boolean).length;

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
        label: formatWebsiteStatus(statusFilter),
        tone: "secondary",
        onRemove: () => setStatusFilter("ALL"),
      });
    }
    if (dateFrom) {
      chips.push({
        key: "from",
        label: `From ${dateFrom}`,
        onRemove: () => setDateFrom(""),
      });
    }
    if (dateTo) {
      chips.push({
        key: "to",
        label: `To ${dateTo}`,
        onRemove: () => setDateTo(""),
      });
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
  }, [search, statusFilter, dateFrom, dateTo, sortBy]);

  if (isError) {
    return <QueryErrorBanner error={error} onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-secondary">
            <Globe className="h-4 w-4" />
            My Websites
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Assigned websites with monitoring status and open issue counts.
          </p>
        </div>
        <Button variant="secondary" asChild>
          <Link to="/issues/new">Report Issue</Link>
        </Button>
      </div>

      <Card className="overflow-hidden shadow-sm">
        <CardContent className="space-y-1 pt-6">
          <ListToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by name or URL..."
            sortValue={sortBy}
            onSortChange={(v) => setSortBy(v as WebsiteSortOption)}
            sortOptions={SORT_OPTIONS}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters((v) => !v)}
            activeFilterCount={activeFilterCount}
          />

          <ListFilterPanel open={showFilters} columns={3}>
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
                  {WEBSITE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {formatWebsiteStatus(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Added from
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
                Added to
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
        <Loader label="Loading websites..." />
      ) : websites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {total === 0 && !hasActiveFilters
              ? "No websites assigned to your account."
              : "No websites match your filters. Try adjusting search or dates."}
          </CardContent>
        </Card>
      ) : (
        <div className="relative grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {isFetching ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-[1px]">
              <Loader size="sm" className="py-0" />
            </div>
          ) : null}
          {websites.map((site) => (
            <WebsiteCard key={site.id} site={site} />
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
