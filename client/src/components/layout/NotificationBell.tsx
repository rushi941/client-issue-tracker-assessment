import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Bell } from "lucide-react";
import { api } from "@/api/client";
import { useAuth } from "@/hooks/useAuth";
import { Notification } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const issuePath = (id: string) =>
    user?.role === "MANAGER" ? `/manager/issues/${id}` : `/issues/${id}`;

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      api<{ notifications: Notification[]; unreadCount: number }>("/api/notifications"),
    refetchInterval: 30000,
    meta: { silent: true },
    retry: 1,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => api(`/api/notifications/${id}/read`, { method: "PATCH" }),
    meta: { silent: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = data?.unreadCount ?? 0;
  const notifications = data?.notifications ?? [];

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
            {unread}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <Card className="absolute right-0 z-20 mt-2 w-80 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Notifications</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="max-h-96 overflow-y-auto p-0">
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`border-b px-4 py-3 last:border-b-0 ${!n.readAt ? "bg-accent/5" : ""}`}
                  >
                    <p className="text-sm">{n.message}</p>
                    {n.issue && (
                      <Link
                        to={issuePath(n.issue.id)}
                        className="mt-1 block text-xs text-accent hover:underline"
                        onClick={() => {
                          if (!n.readAt) markRead.mutate(n.id);
                          setOpen(false);
                        }}
                      >
                        View issue
                      </Link>
                    )}
                    {!n.readAt && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs text-secondary"
                        onClick={() => markRead.mutate(n.id)}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
