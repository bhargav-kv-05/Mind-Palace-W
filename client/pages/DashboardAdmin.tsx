import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertCircle,
  Library,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  Tag,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstitutionAnalytics } from "@/hooks/use-institution-analytics";
import { useAuth } from "@/context/AuthContext";
import type { CountBreakdown } from "@shared/api";

const numberFormatter = new Intl.NumberFormat();

const severityLabels: Record<string, string> = {
  none: "None",
  mild: "Mild",
  moderate: "Moderate",
  moderately_severe: "Moderately severe",
  severe: "Severe",
};

const severityOrder: Record<string, number> = {
  none: 0,
  mild: 1,
  moderate: 2,
  moderately_severe: 3,
  severe: 4,
};

const severityVariantMap: Record<string, BadgeProps["variant"]> = {
  none: "secondary",
  mild: "secondary",
  moderate: "default",
  moderately_severe: "destructive",
  severe: "destructive",
};

const toneLabels: Record<string, string> = {
  positive: "Positive",
  neutral: "Neutral",
  negative: "Support needed",
};

const toneOrder: Record<string, number> = {
  positive: 0,
  neutral: 1,
  negative: 2,
};

const toneVariantMap: Record<string, BadgeProps["variant"]> = {
  positive: "secondary",
  neutral: "outline",
  negative: "destructive",
};

const numberDefault = 0;

export default function DashboardAdmin() {
  const { session } = useAuth();
  const { analytics, loading, error, refresh } = useInstitutionAnalytics(
    session.institutionCode,
  );

  const screeningsBySeverity = sortByOrder(
    analytics?.screenings.bySeverity ?? [],
    severityOrder,
  );
  const alertsBySeverity = sortByOrder(
    analytics?.alerts.bySeverity ?? [],
    severityOrder,
  );
  const topTags = analytics?.alerts.topTags ?? [];
  const libraryByTone = sortByOrder(analytics?.library.byTone ?? [], toneOrder);

  const screeningsTotal = analytics?.screenings.total ?? numberDefault;
  const alertsTotal = sumBreakdown(analytics?.alerts.bySeverity);
  const libraryTotal = sumBreakdown(analytics?.library.byTone);
  const postsTotal = analytics?.posts.total ?? numberDefault;

  return (
    <section className="container space-y-8 py-12">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>
          <p className="text-foreground/70">
            Institution: {session.institutionCode ?? "All campuses"}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={loading}
          className="self-start md:self-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </header>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to load analytics</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {analytics?.note ? (
        <Alert variant="secondary">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>{analytics.note}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={`metric-skeleton-${idx}`}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <MetricCard
              title="Screenings"
              description="PHQ-9 & GAD-7 submissions"
              value={screeningsTotal}
              icon={Activity}
              footer={
                <BreakdownChips
                  items={screeningsBySeverity}
                  emptyMessage="No screenings have been recorded yet."
                  getLabel={(item) =>
                    severityLabels[item._id] ?? formatLabel(item._id)
                  }
                  getVariant={(item) => severityVariantMap[item._id] ?? "secondary"}
                />
              }
            />
            <MetricCard
              title="Alerts"
              description="Active moderation alerts"
              value={alertsTotal}
              icon={ShieldAlert}
              footer={
                <BreakdownChips
                  items={alertsBySeverity}
                  emptyMessage="No alerts raised yet."
                  getLabel={(item) =>
                    severityLabels[item._id] ?? formatLabel(item._id)
                  }
                  getVariant={(item) => severityVariantMap[item._id] ?? "secondary"}
                />
              }
            />
            <MetricCard
              title="Library entries"
              description="Published motivation content"
              value={libraryTotal}
              icon={Library}
              footer={
                <BreakdownChips
                  items={libraryByTone}
                  emptyMessage="No library entries yet."
                  getLabel={(item) => toneLabels[item._id] ?? formatLabel(item._id)}
                  getVariant={(item) => toneVariantMap[item._id] ?? "secondary"}
                />
              }
            />
            <MetricCard
              title="Community posts"
              description="Threads and responses"
              value={postsTotal}
              icon={MessageSquare}
            />
          </>
        )}
      </div>

      {!loading ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Top alert tags</CardTitle>
              <CardDescription>
                Momentum of flagged topics across campuses
              </CardDescription>
            </div>
            <Tag className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <BreakdownChips
              items={topTags}
              emptyMessage="No alert tags captured yet."
              getLabel={(item) => formatLabel(item._id)}
              getVariant={() => "outline"}
            />
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

type BreakdownChipsProps = {
  items: CountBreakdown[];
  emptyMessage: string;
  getLabel: (item: CountBreakdown) => string;
  getVariant?: (item: CountBreakdown) => BadgeProps["variant"];
};

function BreakdownChips({
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

type MetricCardProps = {
  title: string;
  description: string;
  value: number;
  icon: LucideIcon;
  footer?: ReactNode;
};

function MetricCard({ title, description, value, icon: Icon, footer }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold">{formatNumber(value)}</div>
        {footer ? <div className="space-y-2">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatLabel(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function sortByOrder(
  items: CountBreakdown[],
  order: Record<string, number>,
): CountBreakdown[] {
  return [...items].sort(
    (a, b) => (order[a._id] ?? 99) - (order[b._id] ?? 99),
  );
}

function sumBreakdown(items?: CountBreakdown[]): number {
  if (!items?.length) {
    return numberDefault;
  }
  return items.reduce((total, item) => total + item.count, 0);
}
