import { useCallback, useEffect, useState } from "react";

import type { AdminAnalytics } from "@shared/api";

import { api } from "@/lib/api";

interface UseInstitutionAnalyticsResult {
  analytics: AdminAnalytics | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useInstitutionAnalytics(
  institutionCode?: string,
): UseInstitutionAnalyticsResult {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(
    async (signal?: AbortSignal) => {
      if (signal?.aborted) {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams();
        if (institutionCode) {
          query.set("institutionCode", institutionCode);
        }
        const queryString = query.toString();
        const res = await fetch(
          api(`/api/admin/analytics${queryString ? `?${queryString}` : ""}`),
          { signal },
        );
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const payload = (await res.json()) as AdminAnalytics;
        if (!signal?.aborted) {
          setAnalytics(payload);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          return;
        }
        if (!signal?.aborted) {
          setAnalytics(null);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load analytics right now.",
          );
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [institutionCode],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchAnalytics(controller.signal);
    return () => controller.abort();
  }, [fetchAnalytics]);

  const refresh = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, error, refresh };
}
