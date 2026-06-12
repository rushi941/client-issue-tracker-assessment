import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FilterChip {
  key: string;
  label: string;
  tone?: "default" | "accent" | "secondary";
  onRemove: () => void;
}

interface ActiveFilterChipsProps {
  chips: FilterChip[];
  onClearAll?: () => void;
  className?: string;
}

const toneClass: Record<NonNullable<FilterChip["tone"]>, string> = {
  default: "border-border bg-muted/60 text-foreground",
  accent: "border-accent/30 bg-accent/10 text-accent-foreground",
  secondary: "border-secondary/30 bg-secondary/10 text-secondary",
};

export function ActiveFilterChips({ chips, onClearAll, className }: ActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2 border-t border-dashed pt-3", className)}>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Active
      </span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className={cn(
            "group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all hover:scale-[1.02]",
            toneClass[chip.tone ?? "default"],
          )}
        >
          {chip.label}
          <X className="h-3 w-3 opacity-60 transition-opacity group-hover:opacity-100" />
        </button>
      ))}
      {onClearAll ? (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="ml-auto h-auto px-0 text-xs text-muted-foreground"
          onClick={onClearAll}
        >
          Clear all
        </Button>
      ) : null}
    </div>
  );
}
