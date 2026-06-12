import { PaginationControls } from "@/components/ui/pagination-controls";
import { Card, CardContent } from "@/components/ui/card";
import { PageSizeOption } from "@/lib/issue-list-params";
import { PaginationMeta } from "@/types";

interface ListPaginationFooterProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: PageSizeOption) => void;
  disabled?: boolean;
}

export function ListPaginationFooter({
  pagination,
  onPageChange,
  onPageSizeChange,
  disabled,
}: ListPaginationFooterProps) {
  const { page, pageSize, total } = pagination;
  const to = Math.min(page * pageSize, total);
  const progress = total === 0 ? 0 : Math.round((to / total) * 100);

  return (
    <Card className="list-pagination-footer overflow-hidden shadow-sm">
      <div className="list-pagination-progress" style={{ width: `${progress}%` }} />
      <CardContent className="py-4">
        <PaginationControls
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
}
