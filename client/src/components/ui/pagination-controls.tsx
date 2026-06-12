import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PAGE_SIZE_OPTIONS, PageSizeOption } from "@/lib/issue-list-params";
import { getVisiblePages } from "@/lib/pagination-pages";
import { cn } from "@/lib/utils";
import { PaginationMeta } from "@/types";

interface PaginationControlsProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: PageSizeOption) => void;
  disabled?: boolean;
  className?: string;
}

export function PaginationControls({
  pagination,
  onPageChange,
  onPageSizeChange,
  disabled,
  className,
}: PaginationControlsProps) {
  const { page, pageSize, total, totalPages } = pagination;

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const showNav = totalPages > 1;
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          {total === 0 ? (
            "No results"
          ) : (
            <>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {from}–{to}
              </span>{" "}
              of <span className="font-semibold text-foreground">{total}</span>
            </>
          )}
        </p>
        {total > 0 ? (
          <p className="text-xs text-muted-foreground/80">
            Page {page} of {totalPages} · {pageSize} items per view
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 sm:items-end">
        {onPageSizeChange ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Rows
            </span>
            <div className="list-page-size-group inline-flex rounded-lg border border-dashed p-0.5">
              {PAGE_SIZE_OPTIONS.map((size) => {
                const active = size === pageSize;
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={disabled}
                    onClick={() => onPageSizeChange(size)}
                    className={cn(
                      "min-w-[2.25rem] rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all",
                      active
                        ? "bg-secondary text-secondary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      disabled && "opacity-50",
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {showNav ? (
          <Pagination className="w-auto">
            <PaginationContent className="gap-0.5">
              <PaginationItem>
                <PaginationPrevious
                  className="rounded-l-lg rounded-r-none border border-dashed"
                  disabled={disabled || page <= 1}
                  onClick={() => onPageChange(page - 1)}
                />
              </PaginationItem>

              {visiblePages.map((token, index) =>
                token === "gap" ? (
                  <PaginationItem key={`gap-${index}`}>
                    <PaginationEllipsis className="h-9 w-9" />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={token}>
                    <Button
                      type="button"
                      variant={token === page ? "secondary" : "ghost"}
                      size="icon"
                      disabled={disabled}
                      onClick={() => onPageChange(token)}
                      className={cn(
                        "h-9 w-9 rounded-none border-y border-dashed text-xs font-semibold",
                        token === page && "shadow-md shadow-secondary/20",
                      )}
                    >
                      {token}
                    </Button>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  className="rounded-l-none rounded-r-lg border border-dashed"
                  disabled={disabled || page >= totalPages}
                  onClick={() => onPageChange(page + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ChevronLeft className="h-3.5 w-3.5 opacity-40" />
            Single page
            <ChevronRight className="h-3.5 w-3.5 opacity-40" />
          </div>
        )}
      </div>
    </div>
  );
}
