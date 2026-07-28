import { apiClient } from "@/lib/axios";
import type {
  CrawlRecord,
  DashboardStats,
  ScrapeRequestPayload,
  ScrapeResponse,
  EngineUsage,
  DailyCrawlPoint,
} from "@/types";

export async function fetchHistory(): Promise<CrawlRecord[]> {
  const { data } = await apiClient.get<any[]>("/history");
  return data.map((job): CrawlRecord => ({
    id: job.id,
    website: job.title || job.url,
    url: job.url,
    status: job.status,
    engine: job.engine_used,
    title: job.title,
    contentLength: job.content_length,
    createdAt: job.created_at,
  }));
}

export async function triggerScrape(
  payload: ScrapeRequestPayload
): Promise<ScrapeResponse> {
  const { data } = await apiClient.post<ScrapeResponse>("/scrape", payload);
  return data;
}

/** Derived, frontend-only stats — backend only exposes /history. */
export function computeStats(history: CrawlRecord[]): DashboardStats {
  const totalCrawls = history.length;
  const successfulCrawls = history.filter((h) => h.status === "success").length;
  const failedCrawls = history.filter((h) => h.status === "failed").length;
  const totalContentLength = history.reduce((sum, h) => sum + (h.contentLength || 0), 0);
  const averageContentSize = totalCrawls > 0 ? Math.round(totalContentLength / totalCrawls) : 0;

  return { totalCrawls, successfulCrawls, failedCrawls, averageContentSize };
}

export function computeEngineUsage(history: CrawlRecord[]): EngineUsage[] {
  const counts = new Map<string, number>();
  history.forEach((h) => counts.set(h.engine, (counts.get(h.engine) ?? 0) + 1));
  return Array.from(counts.entries()).map(([engine, count]) => ({ engine, count }));
}

export function computeDailyCrawls(history: CrawlRecord[]): DailyCrawlPoint[] {
  const counts = new Map<string, number>();
  history.forEach((h) => {
    const day = new Date(h.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    counts.set(day, (counts.get(day) ?? 0) + 1);
  });
  return Array.from(counts.entries()).map(([date, crawls]) => ({ date, crawls })).slice(-14);
}
