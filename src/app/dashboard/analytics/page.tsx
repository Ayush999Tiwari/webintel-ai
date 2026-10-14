
"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  CheckCircle2, Clock, Database, Sparkles, Globe, FileText,
  Table as TableIcon, Mail, Phone, File, Link2, Share2, Server,
  AlertCircle, BarChart3, Activity, RefreshCw, MessageCircle,
} from "lucide-react";
import Link from "next/link";

type DateRange = "today" | "7d" | "30d" | "all";

interface KPIData {
  total_crawls: number;
  success_rate: number;
  avg_time: number;
  total_data_gb: number;
  ai_summaries: number;
  unique_domains: number;
}

interface TrendData {
  date: string;
  crawls: number;
  success?: number;
  failed?: number;
}

interface EngineData {
  engine: string;
  jobs: number;
  success_rate: number;
  avg_time: number;
}

interface DomainData {
  domain: string;
  crawls: number;
  success_rate: number;
  avg_time: number;
}

interface ErrorData {
  name: string;
  value: number;
  color: string;
}

interface ContentData {
  pages: number;
  images: number;
  tables: number;
  emails: number;
  phones: number;
  pdfs: number;
  links: number;
}

interface AnalyticsData {
  kpis: KPIData | null;
  trends: TrendData[];
  engines: EngineData[];
  topDomains: DomainData[];
  errors: ErrorData[];
  contentStats: ContentData | null;
}

const API_BASE = "http://localhost:8000/analytics";
const COLORS = ["#F43F5E", "#F59E0B", "#8B5CF6", "#64748B", "#0EA5E9", "#CBD5E1"];

const EMPTY_DATA: AnalyticsData = {
  kpis: null,
  trends: [],
  engines: [],
  topDomains: [],
  errors: [],
  contentStats: null,
};

const ERROR_COLORS: Record<string, string> = {
  other: "#64748B",
  timeout: "#F59E0B",
  "403": "#F43F5E",
  "404": "#8B5CF6",
  captcha: "#0EA5E9",
};

function numberValue(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function optionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

async function fetchEndpoint(path: string): Promise<any> {
  const response = await fetch(`${API_BASE}${path}`);

  if (!response.ok) {
    throw new Error(
      `Analytics API failed (${response.status}) for ${path}`
    );
  }

  return response.json();
}

function normalizeAnalytics(
  rawKpis: any,
  rawTrends: any,
  rawEngines: any,
  rawDomains: any,
  rawErrors: any,
  rawContent: any
): AnalyticsData {
  const kpis: KPIData | null = rawKpis
    ? {
        total_crawls: numberValue(rawKpis.total_crawls),
        success_rate: numberValue(rawKpis.success_rate),
        avg_time: numberValue(rawKpis.avg_crawl_time_seconds),
        total_data_gb: Number(
          (numberValue(rawKpis.total_data_bytes) / (1024 ** 3)).toFixed(2)
        ),
        ai_summaries: numberValue(rawKpis.ai_summaries),
        unique_domains: numberValue(rawKpis.unique_domains),
      }
    : null;

  const trends: TrendData[] = Array.isArray(rawTrends)
    ? rawTrends.map((item: any) => ({
        date: String(item.date ?? ""),
        crawls: numberValue(item.count ?? item.crawls),
        success: optionalNumber(item.success_count ?? item.success),
        failed: optionalNumber(item.failed_count ?? item.failed),
      }))
    : [];

  const engines: EngineData[] = Array.isArray(rawEngines)
    ? rawEngines.map((item: any) => ({
        engine: String(item.engine ?? "Unknown"),
        jobs: numberValue(item.jobs),
        success_rate: numberValue(item.success_rate),
        avg_time: numberValue(
          item.avg_time_seconds ?? item.avg_time
        ),
      }))
    : [];

  const topDomains: DomainData[] = Array.isArray(rawDomains)
    ? rawDomains.map((item: any) => ({
        domain: String(item.domain ?? "Unknown"),
        crawls: numberValue(item.crawls ?? item.count),
        success_rate: numberValue(item.success_rate),
        avg_time: numberValue(
          item.avg_time_seconds ?? item.avg_time
        ),
      }))
    : [];

  const errors: ErrorData[] = Array.isArray(rawErrors)
    ? rawErrors.map((item: any, index: number) => {
        const name = String(item.error_type ?? item.name ?? "Unknown");

        return {
          name,
          value: numberValue(item.count ?? item.value),
          color:
            ERROR_COLORS[name.toLowerCase()] ??
            COLORS[index % COLORS.length],
        };
      })
    : [];

  const contentStats: ContentData | null = rawContent
    ? {
        pages: numberValue(rawContent.pages_crawled),
        images: numberValue(rawContent.images_found),
        tables: numberValue(rawContent.tables_extracted),
        emails: numberValue(rawContent.emails_found),
        phones: numberValue(rawContent.phones_found),
        pdfs: numberValue(rawContent.pdfs),
        links: numberValue(rawContent.links_extracted),
      }
    : null;

  return { kpis, trends, engines, topDomains, errors, contentStats };
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData>(EMPTY_DATA);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const range = `?range=${dateRange}`;

      const [
        rawKpis,
        rawTrends,
        rawEngines,
        rawDomains,
        rawErrors,
        rawContent,
      ] = await Promise.all([
        fetchEndpoint(`/kpis${range}`),
        fetchEndpoint(`/trends${range}`),
        fetchEndpoint(`/engines${range}`),
        fetchEndpoint(`/top-domains${range}&limit=10`),
        fetchEndpoint(`/errors${range}`),
        fetchEndpoint(`/content-stats${range}`),
      ]);

      const normalized = normalizeAnalytics(
        rawKpis,
        rawTrends,
        rawEngines,
        rawDomains,
        rawErrors,
        rawContent
      );

      setData(normalized);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load analytics data."
      );
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  if (isLoading) return <AnalyticsSkeleton />;

  if (error) {
    return (
      <div className="min-h-[60vh] p-6 lg:p-8">
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="h-10 w-10 text-rose-500" />
          <h1 className="mt-4 text-xl font-bold text-gray-900">
            Analytics could not be loaded
          </h1>
          <p className="mt-2 break-words text-sm text-gray-600">{error}</p>
          <p className="mt-2 text-xs text-gray-500">
            Verify that the FastAPI backend is running and all analytics
            endpoints are available.
          </p>
          <button
            onClick={() => void fetchData()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasReliabilityCounts = data.trends.some(
    (item) => item.success !== undefined && item.failed !== undefined
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/40 to-white p-6 lg:p-8">
      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Analytics
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Explore real crawling activity, engine performance and extracted
            content from your backend.
          </p>
          {lastUpdated && (
            <p className="mt-2 text-xs text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {(["today", "7d", "30d", "all"] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  dateRange === range
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {range === "7d"
                  ? "Last 7 Days"
                  : range === "30d"
                    ? "Last 30 Days"
                    : range === "all"
                      ? "All Time"
                      : "Today"}
              </button>
            ))}
          </div>

          <button
            onClick={() => void fetchData()}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI overview: no invented trend percentages */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard icon={<Activity className="h-5 w-5" />} label="Total Crawls" value={(data.kpis?.total_crawls ?? 0).toLocaleString()} color="blue" />
        <KPICard icon={<CheckCircle2 className="h-5 w-5" />} label="Success Rate" value={`${(data.kpis?.success_rate ?? 0).toFixed(1)}%`} color="emerald" />
        <KPICard icon={<Clock className="h-5 w-5" />} label="Avg Crawl Time" value={`${(data.kpis?.avg_time ?? 0).toFixed(1)}s`} color="amber" />
        <KPICard icon={<Database className="h-5 w-5" />} label="Data Collected" value={`${data.kpis?.total_data_gb ?? 0} GB`} color="violet" />
        <KPICard icon={<Sparkles className="h-5 w-5" />} label="AI Summaries" value={(data.kpis?.ai_summaries ?? 0).toLocaleString()} color="fuchsia" />
        <KPICard icon={<Globe className="h-5 w-5" />} label="Unique Domains" value={(data.kpis?.unique_domains ?? 0).toLocaleString()} color="indigo" />
      </div>

      {/* Crawling trends */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ChartCard title="Crawling Trends" description="Daily crawl volume returned by the backend">
            {data.trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.trends}>
                  <defs>
                    <linearGradient id="colorCrawls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }} />
                  <Area type="monotone" dataKey="crawls" name="Crawls" stroke="#6366F1" strokeWidth={3} fill="url(#colorCrawls)" />
                  {hasReliabilityCounts && (
                    <Area type="monotone" dataKey="success" name="Successful" stroke="#10B981" strokeWidth={2} fill="transparent" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmptyState icon={<BarChart3 className="h-6 w-6" />} title="No crawl data available" description="Start crawling websites to see trends here." />
            )}
          </ChartCard>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ChartCard title="Success vs Failed" description="Actual daily counts, when provided by the API">
              {hasReliabilityCounts ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.trends} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="date" type="category" width={65} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="success" name="Successful" stackId="a" fill="#10B981" />
                    <Bar dataKey="failed" name="Failed" stackId="a" fill="#F43F5E" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ChartEmptyState icon={<CheckCircle2 className="h-6 w-6" />} title="Daily breakdown unavailable" description="The trends endpoint must return success_count and failed_count for this chart." />
              )}
            </ChartCard>

            <ChartCard title="Engine Comparison" description="Crawl jobs by engine">
              {data.engines.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.engines}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="engine" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="jobs" name="Jobs" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ChartEmptyState icon={<Activity className="h-6 w-6" />} title="No engine data" description="Engine metrics will appear after crawl jobs are recorded." />
              )}
            </ChartCard>
          </div>
        </div>

        {/* Honest AI insights state */}
        <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50/80 to-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">AI Insights</h3>
          </div>
          <p className="text-sm leading-6 text-gray-600">
            Automated analytics insights are not connected to a dedicated
            backend endpoint yet. Performance claims are intentionally hidden
            until they can be generated from real metrics.
          </p>
          <Link
            href="/dashboard/chat"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" />
            Analyze scraped data
          </Link>
        </div>
      </div>

      {/* Top domains */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCard title="Top Crawled Websites" description="Domains reported by the analytics API">
          {data.topDomains.length > 0 ? (
            <div className="space-y-3">
              {data.topDomains.map((domain, index) => (
                <div key={domain.domain} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-gray-600 ring-1 ring-gray-200">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="break-all text-sm font-semibold text-gray-900">{domain.domain}</p>
                      <p className="text-xs text-gray-500">{domain.crawls.toLocaleString()} crawls</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-gray-800">{domain.success_rate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">{domain.avg_time.toFixed(1)}s avg</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ChartEmptyState icon={<Globe className="h-6 w-6" />} title="No domain data" description="Domain metrics will appear when available from the backend." />
          )}
        </ChartCard>

        {/* Real domain performance; no fabricated heatmap */}
        <ChartCard title="Website Performance" description="Actual response metrics by domain">
          {data.topDomains.length > 0 ? (
            <div className="space-y-3">
              {data.topDomains.map((domain) => (
                <div key={domain.domain} className="rounded-xl border border-gray-100 p-3">
                  <p className="break-all text-sm font-semibold text-gray-900">{domain.domain}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <span>Crawls: {domain.crawls.toLocaleString()}</span>
                    <span>Success: {domain.success_rate.toFixed(1)}%</span>
                    <span className="col-span-2">Average crawl time: {domain.avg_time.toFixed(2)} seconds</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ChartEmptyState icon={<Globe className="h-6 w-6" />} title="No performance data" description="Actual domain performance will appear here when the API returns results." />
          )}
        </ChartCard>

        {/* Errors */}
        <ChartCard title="Error Analysis" description="Failure categories reported by the backend">
          {data.errors.length > 0 ? (
            <ResponsiveContainer width="100%" height={270}>
              <PieChart>
                <Pie data={data.errors} cx="50%" cy="45%" innerRadius={55} outerRadius={82} paddingAngle={3} dataKey="value" nameKey="name">
                  {data.errors.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState icon={<AlertCircle className="h-6 w-6" />} title="No error data" description="Recorded crawl error categories will appear here." />
          )}
        </ChartCard>
      </div>

      {/* Content analytics */}
      <div className="mt-6">
        <ChartCard title="Content Analytics" description="Structured content counts returned by the backend">
          {data.contentStats ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
              <ContentStat icon={<FileText className="h-5 w-5" />} label="Pages" value={data.contentStats.pages.toLocaleString()} color="blue" />
              <ContentStat icon={<TableIcon className="h-5 w-5" />} label="Tables" value={data.contentStats.tables.toLocaleString()} color="violet" />
              <ContentStat icon={<Mail className="h-5 w-5" />} label="Emails" value={data.contentStats.emails.toLocaleString()} color="emerald" />
              <ContentStat icon={<Phone className="h-5 w-5" />} label="Phones" value={data.contentStats.phones.toLocaleString()} color="amber" />
              <ContentStat icon={<File className="h-5 w-5" />} label="PDFs" value={data.contentStats.pdfs.toLocaleString()} color="rose" />
              <ContentStat icon={<Link2 className="h-5 w-5" />} label="Links" value={data.contentStats.links.toLocaleString()} color="indigo" />
              <ContentStat icon={<Server className="h-5 w-5" />} label="Images" value={data.contentStats.images.toLocaleString()} color="cyan" />
            </div>
          ) : (
            <ChartEmptyState icon={<FileText className="h-6 w-6" />} title="No content statistics" description="Content metrics are not available from the backend." />
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function ChartEmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        {icon}
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">{description}</p>
    </div>
  );
}

function KPICard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500 to-indigo-600",
    emerald: "from-emerald-500 to-teal-600",
    amber: "from-amber-500 to-orange-600",
    violet: "from-violet-500 to-purple-600",
    fuchsia: "from-fuchsia-500 to-pink-600",
    indigo: "from-indigo-500 to-blue-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
          <p className="mt-2 break-words text-2xl font-bold tracking-tight text-gray-900">{value}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colorMap[color]} text-white shadow-md`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

function ChartCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="text-xs leading-5 text-gray-500">{description}</p>
      </div>
      {children}
    </motion.div>
  );
}

function ContentStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    indigo: "bg-indigo-50 text-indigo-600",
    cyan: "bg-cyan-50 text-cyan-600",
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition hover:bg-white hover:shadow-sm">
      <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs font-medium text-gray-500">{label}</p>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/40 to-white p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-10 w-40 animate-pulse rounded-xl bg-gray-100" />
      </div>
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
            <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
          </div>
        </div>
        <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    </div>
  );
}
