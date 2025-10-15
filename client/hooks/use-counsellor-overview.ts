import { useCallback, useEffect, useState } from "react";

import { useCallback, useEffect, useState } from "react";
import type { CounsellorOverview } from "@shared/api";

import { api } from "@/lib/api";

interface UseCounsellorOverviewResult {
  overview: CounsellorOverview | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCounsellorOverview(
  institutionCode?: string | null,
  counsellorId?: string | null,
): UseCounsellorOverviewResult {
  const [overview, setOverview] = useState<CounsellorOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(
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
        if (counsellorId) {
          query.set("counsellorId", counsellorId);
        }
        const queryString = query.toString();
        const response = await fetch(
          api(`/api/counsellor/overview${queryString ? `?${queryString}` : ""}`),
          { signal },
        );
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const payload = (await response.json()) as CounsellorOverview;
        if (!signal?.aborted) {
          setOverview(payload);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          return;
        }
        if (!signal?.aborted) {
          setOverview(null);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load overview right now.",
          );
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [institutionCode, counsellorId],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchOverview(controller.signal);
    return () => controller.abort();
  }, [fetchOverview]);

  const refresh = useCallback(async () => {
    await fetchOverview();
  }, [fetchOverview]);

  return { overview, loading, error, refresh };
}
