"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchHistory, computeStats, computeEngineUsage, computeDailyCrawls } from "@/lib/api";

export const HISTORY_QUERY_KEY = ["history"] as const;

export function useHistory() {
  const query = useQuery({
    queryKey: HISTORY_QUERY_KEY,
    queryFn: fetchHistory,
    refetchInterval: 15_000,
  });

  const history = query.data ?? [];
  const stats = computeStats(history);
  const engineUsage = computeEngineUsage(history);
  const dailyCrawls = computeDailyCrawls(history);
  const recentHistory = [...history]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return { ...query, history, stats, engineUsage, dailyCrawls, recentHistory };
}
