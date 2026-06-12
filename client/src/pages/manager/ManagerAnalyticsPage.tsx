import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { api } from "@/api/client";
import { Analytics } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryErrorBanner } from "@/components/ui/query-error";
import { formatIssueSeverity, formatIssueStatus } from "@/lib/labels";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
  glowClass,
}: {
  label: string;
  value: string | number;
  icon: typeof BarChart3;
  iconClass: string;
  glowClass: string;
}) {
  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <CardContent className="relative p-6">
        <div
          className={cn(
            "absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full opacity-20 blur-2xl",
            glowClass,
          )}
        />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          </div>
          <div className={cn("rounded-xl p-2.5", iconClass)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BreakdownBar({
  label,
  count,
  total,
  colorClass,
}: {
  label: string;
  count: number;
  total: number;
  colorClass: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <li className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {count} <span className="text-xs">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  );
}

const severityColors: Record<string, string> = {
  LOW: "bg-muted-foreground",
  MEDIUM: "bg-accent",
  HIGH: "bg-warning",
  CRITICAL: "bg-danger",
};

const statusColors: Record<string, string> = {
  OPEN: "bg-secondary",
  IN_REVIEW: "bg-accent",
  IN_PROGRESS: "bg-primary",
  WAITING_FOR_CLIENT: "bg-warning",
  RESOLVED: "bg-success",
  CLOSED: "bg-muted-foreground",
};

export function ManagerAnalyticsPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => api<Analytics>("/api/analytics/dashboard"),
    retry: 1,
  });

  if (isError) {
    return <QueryErrorBanner error={error} onRetry={() => void refetch()} />;
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-28 p-6" />
          </Card>
        ))}
      </div>
    );
  }

  const severityTotal = Object.values(data?.issuesBySeverity ?? {}).reduce((a, b) => a + b, 0);
  const statusTotal = Object.values(data?.issuesByStatus ?? {}).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 sm:p-8">
        <div className="flex items-center gap-2 text-sm font-medium text-accent">
          <TrendingUp className="h-4 w-4" />
          Manager Analytics
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Issue metrics overview</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Track open workload, resolution performance, and severity distribution across all clients.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open Issues"
          value={data?.openIssues ?? 0}
          icon={BarChart3}
          iconClass="bg-secondary/15 text-secondary"
          glowClass="bg-secondary"
        />
        <StatCard
          label="Resolved Issues"
          value={data?.resolvedIssues ?? 0}
          icon={CheckCircle2}
          iconClass="bg-success/15 text-success"
          glowClass="bg-success"
        />
        <StatCard
          label="Critical Open"
          value={data?.criticalIssues ?? 0}
          icon={AlertTriangle}
          iconClass="bg-danger/15 text-danger"
          glowClass="bg-danger"
        />
        <StatCard
          label="Avg Resolution (hrs)"
          value={data?.averageResolutionHours ?? 0}
          icon={Clock}
          iconClass="bg-accent/15 text-accent"
          glowClass="bg-accent"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Issues by Status</CardTitle>
            <CardDescription>Distribution across the issue lifecycle</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {Object.entries(data?.issuesByStatus ?? {})
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => (
                  <BreakdownBar
                    key={status}
                    label={formatIssueStatus(status)}
                    count={count}
                    total={statusTotal}
                    colorClass={statusColors[status] ?? "bg-primary"}
                  />
                ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Issues by Severity</CardTitle>
            <CardDescription>Priority breakdown for triage</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {Object.entries(data?.issuesBySeverity ?? {})
                .sort(([, a], [, b]) => b - a)
                .map(([severity, count]) => (
                  <BreakdownBar
                    key={severity}
                    label={formatIssueSeverity(severity)}
                    count={count}
                    total={severityTotal}
                    colorClass={severityColors[severity] ?? "bg-muted-foreground"}
                  />
                ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
