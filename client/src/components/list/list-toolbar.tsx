import { ChevronDown, Filter, SlidersHorizontal } from "lucide-react";
import { ListSearchBar } from "@/components/list/list-search-bar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SortOption {
  value: string;
  label: string;
}

interface ListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  sortValue: string;
  onSortChange: (value: string) => void;
  sortOptions: SortOption[];
  showFilters: boolean;
  onToggleFilters: () => void;
  activeFilterCount?: number;
}

export function ListToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  sortValue,
  onSortChange,
  sortOptions,
  showFilters,
  onToggleFilters,
  activeFilterCount = 0,
}: ListToolbarProps) {
  const currentSortLabel = sortOptions.find((o) => o.value === sortValue)?.label ?? "Sort";

  return (
    <div className="list-toolbar rounded-xl p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-3">
        <ListSearchBar
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />

        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <Select value={sortValue} onValueChange={onSortChange}>
            <SelectTrigger className="list-sort-trigger h-11 w-[11.5rem] border-dashed">
              <SlidersHorizontal className="mr-2 h-4 w-4 shrink-0 text-secondary" />
              <SelectValue>{currentSortLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent align="end">
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant={showFilters ? "secondary" : "outline"}
            size="sm"
            className={cn(
              "h-11 gap-2 border-dashed px-4 transition-all",
              showFilters && "shadow-md shadow-secondary/20",
            )}
            onClick={onToggleFilters}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-foreground/20 px-1.5 text-[10px] font-bold">
                {activeFilterCount}
              </span>
            ) : null}
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", showFilters && "rotate-180")}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
