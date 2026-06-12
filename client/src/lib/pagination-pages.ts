export type PageToken = number | "gap";

export function getVisiblePages(current: number, total: number): PageToken[] {
  if (total <= 1) return total === 1 ? [1] : [];
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: PageToken[] = [1];

  if (current > 3) pages.push("gap");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("gap");
  pages.push(total);

  return pages.filter((page, index, arr) => page !== arr[index - 1]);
}
