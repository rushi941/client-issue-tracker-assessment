import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/api/client";
import { ActivityLog, Issue } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge, IssueStatusBadge } from "@/components/ui/badge";
import { Timeline } from "@/components/issues/Timeline";
import { BackButton, useGoBack } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatIssueCategory } from "@/lib/labels";

export function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();
  const goBack = useGoBack("/issues");

  const { data: issue } = useQuery({
    queryKey: ["issue", id],
    queryFn: () => api<Issue>(`/api/issues/${id}`),
    enabled: !!id,
  });

  const { data: timeline } = useQuery({
    queryKey: ["timeline", id],
    queryFn: () => api<ActivityLog[]>(`/api/issues/${id}/timeline`),
    enabled: !!id,
  });

  const addComment = useMutation({
    mutationFn: () =>
      api(`/api/issues/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ body: comment.trim() }),
      }),
    meta: { successMessage: "Comment added" },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["issue", id] });
      queryClient.invalidateQueries({ queryKey: ["timeline", id] });
      goBack();
    },
  });

  const summarize = useMutation({
    mutationFn: () => api<{ summary: string }>(`/api/ai/issues/${id}/summary`),
    meta: { successMessage: "AI summary generated" },
  });

  if (!issue) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-4">
      <BackButton fallbackTo="/issues" />

      <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <CardTitle>{issue.title}</CardTitle>
              <div className="flex gap-2">
                <SeverityBadge severity={issue.severity} />
                <IssueStatusBadge status={issue.status} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{issue.description}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>{issue.website?.name}</span>
              <span>{formatIssueCategory(issue.category)}</span>
              {issue.assignee && <span>Assigned: {issue.assignee.name}</span>}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => summarize.mutate()}
              disabled={summarize.isPending}
            >
              AI Summary
            </Button>
            {summarize.data && (
              <p className="mt-2 rounded-lg bg-accent/10 p-3 text-sm">{summarize.data.summary}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {issue.comments?.map((c) => (
                <div
                  key={c.id}
                  className={`rounded-lg p-3 ${c.isManagerResponse ? "bg-primary/5" : "bg-muted/50"}`}
                >
                  <p className="text-sm">{c.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.author.name} · {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && comment.trim()) addComment.mutate();
                }}
              />
              <Button
                onClick={() => addComment.mutate()}
                disabled={!comment.trim() || addComment.isPending}
              >
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline activities={timeline ?? []} />
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
