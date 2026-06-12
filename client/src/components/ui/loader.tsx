import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

export function Loader({ className, label, size = "md" }: LoaderProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-2 py-12", className)}
      role="status"
      aria-live="polite"
    >
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {label ? <p className="text-sm text-muted-foreground">{label}</p> : null}
      <span className="sr-only">{label ?? "Loading"}</span>
    </div>
  );
}
