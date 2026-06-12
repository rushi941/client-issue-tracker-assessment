import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ListFilterPanelProps {
  open: boolean;
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

const columnClass: Record<NonNullable<ListFilterPanelProps["columns"]>, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function ListFilterPanel({ open, children, columns = 3 }: ListFilterPanelProps) {
  return (
    <div
      className={cn(
        "list-filter-panel grid transition-all duration-300 ease-out",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="overflow-hidden">
        <div
          className={cn(
            "list-filter-panel-inner mt-3 grid gap-4 p-4",
            columnClass[columns],
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
