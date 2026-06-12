import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { WebsiteOption } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ISSUE_CATEGORIES,
  ISSUE_SEVERITIES,
  formatIssueCategory,
  formatIssueSeverity,
} from "@/lib/labels";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  websiteId: z.string().min(1, "Select a website"),
  category: z.enum(["BUG", "FEEDBACK", "SUGGESTION", "IMPROVEMENT"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
});

type FormData = z.infer<typeof schema>;

export function NewIssuePage() {
  const navigate = useNavigate();
  const { data: websites } = useQuery({
    queryKey: ["websites", "options"],
    queryFn: () => api<WebsiteOption[]>("/api/websites/options"),
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { severity: "MEDIUM", category: "BUG" },
  });

  const title = watch("title");
  const description = watch("description");

  const createIssue = useMutation({
    mutationFn: (data: FormData) =>
      api("/api/issues", { method: "POST", body: JSON.stringify(data) }),
    meta: { successMessage: "Issue submitted successfully" },
    onSuccess: () => navigate("/issues", { replace: true }),
  });

  const aiSuggest = useMutation({
    mutationFn: () =>
      api<{ category: string; severity: string; suggestedAction: string }>("/api/ai/suggest", {
        method: "POST",
        body: JSON.stringify({ title, description }),
      }),
    meta: { successMessage: "AI suggestions applied" },
    onSuccess: (data) => {
      setValue("category", data.category as FormData["category"]);
      setValue("severity", data.severity as FormData["severity"]);
    },
  });

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Report an Issue</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((d) => createIssue.mutate(d))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Brief summary of the issue" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Describe the issue in detail..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Associated Website</Label>
            <Controller
              control={control}
              name="websiteId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select website" />
                  </SelectTrigger>
                  <SelectContent>
                    {websites?.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.websiteId && (
              <p className="text-xs text-destructive">{errors.websiteId.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ISSUE_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {formatIssueCategory(c)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Severity</Label>
              <Controller
                control={control}
                name="severity"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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
                )}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => aiSuggest.mutate()}
              disabled={!title || !description || aiSuggest.isPending}
            >
              AI Suggest
            </Button>
            <Button type="submit" variant="secondary" disabled={createIssue.isPending}>
              {createIssue.isPending ? "Submitting..." : "Submit Issue"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
