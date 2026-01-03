import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertCircle,
  Clock,
  Library,
  RefreshCw,
  ShieldAlert,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { BadgeProps } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BreakdownChips,
  formatLabel,
  formatNumber,
  sortByOrder,
  sumBreakdown,
} from "@/components/dashboard/AnalyticsBreakdown";
import { useCounsellorOverview } from "@/hooks/use-counsellor-overview";
import { useAuth } from "@/context/AuthContext";
import type {
  CounsellorAlertSummary,
  CounsellorScreeningSummary,
} from "@shared/api";

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

const anxietySeverityLabels: Record<string, string> = {
  none: "None",
  mild: "Mild",
  moderate: "Moderate",
  severe: "Severe",
};

const alertSeverityLabels: Record<CounsellorAlertSummary["severity"], string> =
  {
    severe: "Immediate follow-up",
    moderate: "Check in soon",
    low: "Monitor",
  };

const alertSeverityVariant: Record<
  CounsellorAlertSummary["severity"],
  BadgeProps["variant"]
> = {
  severe: "destructive",
  moderate: "default",
  low: "secondary",
};

const alertSeverityOrder: Record<string, number> = {
  severe: 0,
  moderate: 1,
  low: 2,
};

export default function DashboardCounsellor() {
  const { session } = useAuth();
  const institutionCode = session.institutionCode ?? undefined;
  const counsellorId = session.counsellorId ?? undefined;

  const { overview, loading, error, refresh } = useCounsellorOverview(
    institutionCode,
    counsellorId,
  );

  const initialLoading = loading && !overview;
  const screeningsBySeverity = sortByOrder(
    overview?.screenings.bySeverity ?? [],
    severityOrder,
  );
  const alertsBySeverity = sortByOrder(
    overview?.alerts.bySeverity ?? [],
    alertSeverityOrder,
  );

  const screeningsTotal = sumBreakdown(overview?.screenings.bySeverity);
  const alertsTotal = sumBreakdown(overview?.alerts.bySeverity);
  const volunteerActive = overview?.volunteers.active ?? 0;
  const volunteerTotal = overview?.volunteers.total ?? 0;
  const volunteerNominated = overview?.volunteers.nominated ?? 0;
  const volunteerMembers = overview?.volunteers.members ?? [];
  const postsNeedingResponse = overview?.community.postsNeedingResponse ?? 0;
  const resourcesShared = overview?.community.resourcesShared ?? 0;

  return (
    <section className="container space-y-8 py-12">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Counsellor Dashboard</h1>
          <p className="text-foreground/70">
            Monitoring{" "}
            {session.institutionName ? (
              <>
                <span className="font-medium">{session.institutionName}</span>
                {institutionCode && (
                  <span className="text-foreground/50">
                    {" "}
                    · {institutionCode}
                  </span>
                )}
              </>
            ) : (
              <>all campuses</>
            )}
            {counsellorId ? ` · ID ${counsellorId}` : ""}
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
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </header>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to load overview</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {overview?.note ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>{overview.note}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {initialLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card key={`metric-skeleton-${idx}`}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <MetricCard
              title="Screenings"
              description="Recent PHQ-9 & GAD-7 submissions"
              value={screeningsTotal}
              icon={Activity}
              footer={
                <BreakdownChips
                  items={screeningsBySeverity}
                  emptyMessage="No screenings on record yet."
                  getLabel={(item) =>
                    severityLabels[item._id] ?? formatLabel(item._id)
                  }
                  getVariant={(item) =>
                    severityVariantMap[item._id] ?? "secondary"
                  }
                />
              }
            />
            <MetricCard
              title="Alerts"
              description="Escalations needing attention"
              value={alertsTotal}
              icon={ShieldAlert}
              footer={
                <BreakdownChips
                  items={alertsBySeverity}
                  emptyMessage="No alerts raised yet."
                  getLabel={(item) =>
                    alertSeverityLabels[
                      item._id as CounsellorAlertSummary["severity"]
                    ] ?? formatLabel(item._id)
                  }
                  getVariant={(item) =>
                    alertSeverityVariant[
                      item._id as CounsellorAlertSummary["severity"]
                    ] ?? "secondary"
                  }
                />
              }
            />
            <MetricCard
              title="Peer mentors"
              description="Active volunteers in your network"
              value={volunteerActive}
              icon={Users}
              footer={
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    Nominated: {formatNumber(volunteerNominated)}
                  </Badge>
                  <span>Total available: {formatNumber(volunteerTotal)}</span>
                </div>
              }
            />
            <MetricCard
              title="Community follow-ups"
              description="Threads needing counsellor responses"
              value={postsNeedingResponse}
              icon={Library}
              footer={
                <p className="text-sm text-muted-foreground">
                  Resources shared recently: {formatNumber(resourcesShared)}
                </p>
              }
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <ScreeningsPanel
          loading={initialLoading}
          items={overview?.screenings.recent ?? []}
        />
        <div className="space-y-6">
          <AlertsPanel
            loading={initialLoading}
            items={overview?.alerts.recent ?? []}
          />
          <VolunteerPanel
            loading={initialLoading}
            members={volunteerMembers}
            nominatedCount={volunteerNominated}
            total={volunteerTotal}
          />
        </div>
      </div>
    </section>
  );
}

type MetricCardProps = {
  title: string;
  description: string;
  value: number;
  icon: LucideIcon;
  footer?: ReactNode;
};

function MetricCard({
  title,
  description,
  value,
  icon: Icon,
  footer,
}: MetricCardProps) {
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

type ScreeningsPanelProps = {
  loading: boolean;
  items: CounsellorScreeningSummary[];
};

function ScreeningsPanel({ loading, items }: ScreeningsPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Recent screenings
        </CardTitle>
        <CardDescription>
          Highest risk scores appear first. Ensure urgent cases get a follow-up.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ListSkeleton rows={3} />
        ) : items.length ? (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={`${item.studentAnonymousId}-${item.submittedAt}`}
                className="space-y-3 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{item.studentAnonymousId}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {formatRelativeTime(item.submittedAt)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge
                    variant={
                      severityVariantMap[item.phq9Severity] ?? "secondary"
                    }
                  >
                    PHQ-9 ·{" "}
                    {severityLabels[item.phq9Severity] ?? item.phq9Severity}
                  </Badge>
                  <Badge
                    variant={
                      severityVariantMap[item.gad7Severity] ?? "secondary"
                    }
                  >
                    GAD-7 ·{" "}
                    {anxietySeverityLabels[item.gad7Severity] ??
                      item.gad7Severity}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Scores: {item.phq9Total} PHQ · {item.gad7Total} GAD
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No screenings submitted yet." />
        )}
      </CardContent>
    </Card>
  );
}

type AlertsPanelProps = {
  loading: boolean;
  items: CounsellorAlertSummary[];
};

function AlertsPanel({ loading, items }: AlertsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Alert queue</CardTitle>
        <CardDescription>
          Review sensitive conversations and escalate to crisis teams if needed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ListSkeleton rows={3} />
        ) : items.length ? (
          <ul className="space-y-3">
            {items.map((alert) => (
              <li key={alert.id} className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge
                    variant={
                      alertSeverityVariant[alert.severity] ?? "secondary"
                    }
                  >
                    {alertSeverityLabels[alert.severity] ??
                      formatLabel(alert.severity)}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {formatRelativeTime(alert.createdAt)}
                  </span>
                </div>
                {alert.primaryTag ? (
                  <Badge
                    variant="outline"
                    className="text-xs uppercase tracking-wide"
                  >
                    #{formatLabel(alert.primaryTag)}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No specific tag detected.
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No alerts in your queue right now." />
        )}
      </CardContent>
    </Card>
  );
}

type VolunteerPanelProps = {
  loading: boolean;
  members: {
    id: string;
    displayName: string;
    nominatedBy: string | null;
  }[];
  nominatedCount: number;
  total: number;
};

function VolunteerPanel({
  loading,
  members,
  nominatedCount,
  total,
}: VolunteerPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Peer mentor roster
        </CardTitle>
        <CardDescription>
          Trusted volunteers who can moderate chats when you are offline.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ListSkeleton rows={3} />
        ) : members.length ? (
          <ul className="space-y-2">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <span className="font-medium">{member.displayName}</span>
                {member.nominatedBy ? (
                  <Badge variant="outline" className="text-xs">
                    Nominated by {member.nominatedBy}
                  </Badge>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="No peer mentors nominated yet." />
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          {formatNumber(nominatedCount)} nominated · {formatNumber(total)} in
          network
        </span>
        <Button variant="outline" size="sm" asChild>
          <Link to="/chat">Open moderation center</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

type ListSkeletonProps = {
  rows: number;
};

function ListSkeleton({ rows }: ListSkeletonProps) {
  return (
    <ul className="space-y-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <li key={`skeleton-${idx}`} className="space-y-2 rounded-lg border p-4">
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
        </li>
      ))}
    </ul>
  );
}

type EmptyStateProps = {
  message: string;
};

function EmptyState({ message }: EmptyStateProps) {
  return <p className="text-sm text-muted-foreground">{message}</p>;
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }
  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absMs < minute) {
    return "Just now";
  }
  if (absMs < hour) {
    return rtf.format(Math.round(diffMs / minute), "minute");
  }
  if (absMs < day) {
    return rtf.format(Math.round(diffMs / hour), "hour");
  }
  return rtf.format(Math.round(diffMs / day), "day");
}
