import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { CountBreakdown } from "@shared/api";

const numberFormatter = new Intl.NumberFormat();

export const DEFAULT_TOTAL = 0;

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatLabel(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function sortByOrder(
  items: CountBreakdown[],
  order: Record<string, number>,
): CountBreakdown[] {
  return [...items].sort(
    (a, b) => (order[a._id] ?? 99) - (order[b._id] ?? 99),
  );
}

export function sumBreakdown(items?: CountBreakdown[]): number {
  if (!items?.length) {
    return DEFAULT_TOTAL;
  }
  return items.reduce((total, item) => total + item.count, 0);
}

export type BreakdownChipsProps = {
  items: CountBreakdown[];
  emptyMessage: string;
  getLabel: (item: CountBreakdown) => string;
  getVariant?: (item: CountBreakdown) => BadgeProps["variant"];
};

export function BreakdownChips({
  items,
  emptyMessage,
  getLabel,
  getVariant,
}: BreakdownChipsProps) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge
          key={item._id}
          variant={getVariant?.(item) ?? "secondary"}
          className="gap-1"
        >
          <span>{getLabel(item)}</span>
          <span className="font-semibold">{formatNumber(item.count)}</span>
        </Badge>
      ))}
    </div>
  );
}
