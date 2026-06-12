import { AlertCircle } from "lucide-react";
import { getErrorMessage } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function QueryErrorBanner({
  error,
  onRetry,
  title = "Unable to load data",
}: {
  error: unknown;
  onRetry: () => void;
  title?: string;
}) {
  const message = getErrorMessage(error);
  const isOffline = message.toLowerCase().includes("fetch");

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-destructive">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isOffline
                ? "Cannot reach the API server. Make sure the backend is running on port 3001."
                : message}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}
