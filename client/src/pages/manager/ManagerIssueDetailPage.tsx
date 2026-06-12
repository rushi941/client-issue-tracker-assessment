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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ISSUE_SEVERITIES,
  ISSUE_STATUSES,
  formatIssueCategory,
  formatIssueSeverity,
  formatIssueStatus,
} from "@/lib/labels";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ManagerIssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [response, setResponse] = useState("");
  const queryClient = useQueryClient();
  const goBack = useGoBack("/manager/issues");

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

  const { data: managers } = useQuery({
    queryKey: ["managers"],
    queryFn: () => api<Array<{ id: string; name: string }>>("/api/issues/managers"),
  });

  const updateIssue = useMutation({
    mutationFn: (body: object) =>
      api(`/api/issues/${id}/manage`, { method: "PATCH", body: JSON.stringify(body) }),
    meta: { successMessage: "Issue updated" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issue", id] });
      queryClient.invalidateQueries({ queryKey: ["timeline", id] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  const addResponse = useMutation({
    mutationFn: () =>
      api(`/api/issues/${id}/responses`, {
        method: "POST",
        body: JSON.stringify({ body: response.trim() }),
      }),
    meta: { successMessage: "Response sent" },
    onSuccess: () => {
      setResponse("");
      queryClient.invalidateQueries({ queryKey: ["issue", id] });
      queryClient.invalidateQueries({ queryKey: ["timeline", id] });
      goBack();
    },
  });

  const suggestResponse = useMutation({
    mutationFn: () => api<{ response: string }>(`/api/ai/issues/${id}/suggest-response`),
    meta: { successMessage: "AI response suggestion applied" },
    onSuccess: (data) => setResponse(data.response),
  });

  if (!issue) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-4">
      <BackButton fallbackTo="/manager/issues" />

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
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>Client: {issue.createdBy?.name}</span>
              <span>Category: {formatIssueCategory(issue.category)}</span>
              <span>Website: {issue.website?.name}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manage Issue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={issue.status}
                  onValueChange={(value) => updateIssue.mutate({ status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ISSUE_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {formatIssueStatus(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select
                  value={issue.severity}
                  onValueChange={(value) => updateIssue.mutate({ severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ISSUE_SEVERITIES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {formatIssueSeverity(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assignee</Label>
                <Select
                  value={issue.assigneeId ?? "unassigned"}
                  onValueChange={(value) =>
                    updateIssue.mutate({ assigneeId: value === "unassigned" ? null : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {managers?.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manager Response</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={3}
              placeholder="Write a response to the client..."
            />
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => suggestResponse.mutate()}
                disabled={suggestResponse.isPending}
              >
                AI Suggest Response
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => addResponse.mutate()}
                disabled={!response.trim() || addResponse.isPending}
              >
                Send Response
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline activities={timeline ?? []} />
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
