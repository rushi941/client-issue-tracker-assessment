import { Search, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ListSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export function ListSearchBar({ value, onChange, placeholder, className }: ListSearchBarProps) {
  return (
    <div className={cn("list-search-shell group min-w-[220px] flex-1", className)}>
      <span className="list-search-icon" aria-hidden>
        <Search className="h-4 w-4" />
      </span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="list-search-input h-11 border-0 bg-transparent pl-12 pr-10 shadow-none focus-visible:ring-0"
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      ) : (
        <Sparkles
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent/40 transition-opacity group-focus-within:opacity-0"
          aria-hidden
        />
      )}
    </div>
  );
}
