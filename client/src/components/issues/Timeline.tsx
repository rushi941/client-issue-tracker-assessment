import { ActivityLog } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatActivityType } from "@/lib/labels";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  MessageSquare,
  Reply,
  UserPlus,
  AlertTriangle,
  GitBranch,
  Pencil,
  PlusCircle,
} from "lucide-react";

const activityConfig: Record<
  string,
  { icon: typeof PlusCircle; badgeClass: string }
> = {
  CREATED: { icon: PlusCircle, badgeClass: "bg-primary/10 text-primary" },
  UPDATED: { icon: Pencil, badgeClass: "bg-muted text-muted-foreground" },
  ASSIGNED: { icon: UserPlus, badgeClass: "bg-accent/10 text-accent" },
  STATUS_CHANGED: { icon: GitBranch, badgeClass: "bg-secondary/10 text-secondary" },
  SEVERITY_CHANGED: { icon: AlertTriangle, badgeClass: "bg-warning/10 text-warning" },
  COMMENT: { icon: MessageSquare, badgeClass: "bg-muted text-foreground" },
  RESPONSE: { icon: Reply, badgeClass: "bg-primary/10 text-primary" },
  RESOLVED: { icon: CheckCircle2, badgeClass: "bg-success/10 text-success" },
};

function ActivityIcon({ type }: { type: string }) {
  const config = activityConfig[type] ?? activityConfig.UPDATED;
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "absolute -left-[11px] mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-card",
        config.badgeClass,
      )}
    >
      <Icon className="h-3 w-3" />
    </span>
  );
}

export function Timeline({ activities }: { activities: ActivityLog[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <ol className="relative space-y-0 border-l-2 border-accent/30 pl-6">
      {activities.map((a) => {
        const config = activityConfig[a.type] ?? activityConfig.UPDATED;
        return (
          <li key={a.id} className="relative pb-6 last:pb-0">
            <ActivityIcon type={a.type} />
            <Badge variant="outline" className={cn("mb-1 text-[10px]", config.badgeClass)}>
              {formatActivityType(a.type)}
            </Badge>
            <p className="text-sm font-medium">{a.message}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {a.actor.name} ({a.actor.role}) · {new Date(a.createdAt).toLocaleString()}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
