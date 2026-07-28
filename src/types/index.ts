export type CrawlStatus = "success" | "running" | "failed" | "pending" | "partial";

export interface CrawlRecord {
  id: string;
  website: string;
  url:string;
  engine: string;
  title: string;
  contentLength: number;
  status: CrawlStatus;
  createdAt: string;
}

export interface ScrapeRequestPayload {
  url: string;
}

export interface ScrapeResponse {
  id: string;
  status: CrawlStatus;
  website: string;
}

export interface DashboardStats {
  totalCrawls: number;
  successfulCrawls: number;
  failedCrawls: number;
  averageContentSize: number;
}

export interface EngineUsage {
  engine: string;
  count: number;
}

export interface DailyCrawlPoint {
  date: string;
  crawls: number;
}
