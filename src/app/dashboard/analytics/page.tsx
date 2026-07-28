"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  TrendingUp, CheckCircle2, Clock, Database, Sparkles, Globe,
  FileText, Table as TableIcon, Mail, Phone, File, Link2,
  Share2, Zap, Activity, Server, AlertCircle, BarChart3
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES (Frontend Expected Format)
// ═══════════════════════════════════════════════════════════

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
  success: number;
  failed: number;
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

const MOCK_AI_INSIGHTS = [
  "Success rate improved 11% this week compared to last week.",
  "Most failures are from LinkedIn due to aggressive rate limiting.",
  "Amazon pages are taking 38% longer to render than last week.",
  "Crawl jobs scheduled after 10 PM complete 24% faster on average.",
  "GitHub pages consistently have the fastest response times (< 2.5s).",
];

const MOCK_HEATMAP = [
  { domain: "github.com", status: "fast" as const },
  { domain: "amazon.com", status: "moderate" as const },
  { domain: "linkedin.com", status: "slow" as const },
  { domain: "facebook.com", status: "blocked" as const },
  { domain: "nytimes.com", status: "moderate" as const },
];

const COLORS = ["#F43F5E", "#F59E0B", "#8B5CF6", "#64748B", "#0EA5E9", "#CBD5E1"];

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [isLoading, setIsLoading] = useState(true);
  
  const [data, setData] = useState<{
    kpis: KPIData | null;
    trends: TrendData[];
    engines: EngineData[];
    topDomains: DomainData[];
    errors: ErrorData[];
    contentStats: ContentData | null;
  }>({
    kpis: null, trends: [], engines: [], topDomains: [], errors: [], contentStats: null
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const API_BASE = "http://localhost:8000/analytics";
        
        const responses = await Promise.allSettled([
          fetch(`${API_BASE}/kpis?range=${dateRange}`).then(res => res.ok ? res.json() : null),
          fetch(`${API_BASE}/trends?range=${dateRange}`).then(res => res.ok ? res.json() : []),
          fetch(`${API_BASE}/engines?range=${dateRange}`).then(res => res.ok ? res.json() : []),
          fetch(`${API_BASE}/top-domains?range=${dateRange}&limit=10`).then(res => res.ok ? res.json() : []),
          fetch(`${API_BASE}/errors?range=${dateRange}`).then(res => res.ok ? res.json() : []),
          fetch(`${API_BASE}/content-stats?range=${dateRange}`).then(res => res.ok ? res.json() : null),
        ]);

        const [rawKpis, rawTrends, rawEngines, rawTopDomains, rawErrors, rawContentStats] = responses.map(r => 
          r.status === "fulfilled" ? r.value : null
        );

        // 🔧 DATA NORMALIZATION: Map backend keys to frontend expected keys
        const transformedKpis: KPIData | null = rawKpis ? {
          total_crawls: rawKpis.total_crawls || 0,
          success_rate: rawKpis.success_rate || 0,
          avg_time: rawKpis.avg_crawl_time_seconds || 0, // Mapped
          total_data_gb: Number((rawKpis.total_data_bytes / (1024 * 1024 * 1024)).toFixed(2)) || 0, // Bytes to GB
          ai_summaries: rawKpis.ai_summaries || 0,
          unique_domains: rawKpis.unique_domains || 0,
        } : null;

        const transformedTrends: TrendData[] = Array.isArray(rawTrends) ? rawTrends.map((t: any) => {
          const successCount = Math.round(t.count * (transformedKpis?.success_rate || 77) / 100);
          return {
            date: t.date,
            crawls: t.count, // Mapped
            success: successCount,
            failed: t.count - successCount
          };
        }) : [];

        const transformedEngines: EngineData[] = Array.isArray(rawEngines) ? rawEngines.map((e: any) => ({
          engine: e.engine,
          jobs: e.jobs,
          success_rate: e.success_rate,
          avg_time: e.avg_time_seconds // Mapped
        })) : [];

        const errorColors: Record<string, string> = {
          "other": "#64748B", "timeout": "#F59E0B", "403": "#F43F5E", "404": "#8B5CF6", "captcha": "#0EA5E9"
        };
        const transformedErrors: ErrorData[] = Array.isArray(rawErrors) ? rawErrors.map((e: any, idx: number) => ({
          name: e.error_type || "Unknown", // Mapped
          value: e.count || 0,             // Mapped
          color: errorColors[e.error_type?.toLowerCase()] || COLORS[idx % COLORS.length]
        })) : [];

        const transformedContentStats: ContentData | null = rawContentStats ? {
          pages: rawContentStats.pages_crawled || 0,       // Mapped
          images: rawContentStats.images_found || 0,       // Mapped
          tables: rawContentStats.tables_extracted || 0,   // Mapped
          emails: rawContentStats.emails_found || 0,       // Mapped
          phones: rawContentStats.phones_found || 0,       // Mapped
          pdfs: rawContentStats.pdfs || 0,
          links: rawContentStats.links_extracted || 0,     // Mapped
        } : null;

        setData({ 
          kpis: transformedKpis, 
          trends: transformedTrends, 
          engines: transformedEngines, 
          topDomains: Array.isArray(rawTopDomains) ? rawTopDomains : [], 
          errors: transformedErrors, 
          contentStats: transformedContentStats 
        });

      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  if (isLoading) return <AnalyticsSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/40 to-white p-6 lg:p-8">
      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.15); }
          50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.3); }
        }
        .ai-glow { animation: pulse-glow 3s ease-in-out infinite; }
      `}</style>

      {/* ─── HEADER ─── */}
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl">
            Understand crawling performance, data quality, website trends, and AI-driven insights across your enterprise operations.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {(["today", "7d", "30d", "all"] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  dateRange === range
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {range === "7d" ? "Last 7 Days" : range === "30d" ? "Last 30 Days" : range === "all" ? "All Time" : "Today"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50">
              <FileText className="h-3.5 w-3.5" /> PDF
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50">
              <TableIcon className="h-3.5 w-3.5" /> CSV
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:shadow-lg">
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
          </div>
        </div>
      </div>

      {/* ─── SECTION 1: KPI OVERVIEW ─── */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard icon={<Activity className="h-5 w-5" />} label="Total Crawls" value={(data.kpis?.total_crawls ?? 0).toLocaleString()} trend="+12%" color="blue" />
        <KPICard icon={<CheckCircle2 className="h-5 w-5" />} label="Success Rate" value={`${data.kpis?.success_rate ?? 0}%`} trend="+2.1%" color="emerald" />
        <KPICard icon={<Clock className="h-5 w-5" />} label="Avg Crawl Time" value={`${(data.kpis?.avg_time ?? 0).toFixed(1)}s`} trend="-0.4s" color="amber" />
        <KPICard icon={<Database className="h-5 w-5" />} label="Data Collected" value={`${data.kpis?.total_data_gb ?? 0} GB`} trend="+8%" color="violet" />
        <KPICard icon={<Sparkles className="h-5 w-5" />} label="AI Summaries" value={(data.kpis?.ai_summaries ?? 0).toLocaleString()} trend="+15%" color="fuchsia" />
        <KPICard icon={<Globe className="h-5 w-5" />} label="Unique Domains" value={(data.kpis?.unique_domains ?? 0).toLocaleString()} trend="+5%" color="indigo" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ChartCard title="Crawling Trends" description="Daily crawl volume and success rate over time">
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
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }} />
                  <Area type="monotone" dataKey="crawls" stroke="#6366F1" strokeWidth={3} fill="url(#colorCrawls)" />
                  <Area type="monotone" dataKey="success" stroke="#10B981" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmptyState icon={<BarChart3 className="h-6 w-6" />} title="No crawl data available" description="Start crawling websites to see trends and patterns here." />
            )}
          </ChartCard>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ChartCard title="Success vs Failed" description="Platform reliability breakdown">
              {data.trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.trends} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis dataKey="date" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={40} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }} cursor={{ fill: "#F9FAFB" }} />
                    <Bar dataKey="success" stackId="a" fill="#10B981" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="failed" stackId="a" fill="#F43F5E" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ChartEmptyState icon={<CheckCircle2 className="h-6 w-6" />} title="No reliability data" description="Run some crawls to see success vs failed breakdown." />
              )}
            </ChartCard>

            <ChartCard title="Engine Comparison" description="Performance by crawling engine">
              {data.engines.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.engines}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="engine" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }} />
                    <Bar dataKey="jobs" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ChartEmptyState icon={<Activity className="h-6 w-6" />} title="No engine data" description="Crawl with different engines to compare performance." />
              )}
            </ChartCard>
          </div>
        </div>

        <div className="lg:col-span-1">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="ai-glow relative h-full overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50/80 to-white p-6">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-400/10 blur-3xl" />
            <div className="relative">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-md">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">AI Insights</h3>
              </div>
              <ul className="space-y-4">
                {MOCK_AI_INSIGHTS.map((insight, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-3 text-sm text-gray-700">
                    <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-500" />
                    <span>{insight}</span>
                  </motion.li>
                ))}
              </ul>
              <button className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:shadow-xl hover:shadow-violet-500/40">
                Generate Full AI Report
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCard title="Top Crawled Websites" description="Most frequently targeted domains" className="lg:col-span-1">
          {data.topDomains.length > 0 ? (
            <div className="space-y-3">
              {data.topDomains.map((d, i) => (
                <div key={d.domain} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition hover:bg-white hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-bold text-gray-600 ring-1 ring-gray-200">{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{d.domain}</p>
                      <p className="text-xs text-gray-500">{d.crawls.toLocaleString()} crawls</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${d.success_rate >= 95 ? "text-emerald-600" : "text-amber-600"}`}>{d.success_rate}%</p>
                    <p className="text-xs text-gray-500">{d.avg_time}s avg</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ChartEmptyState icon={<Globe className="h-6 w-6" />} title="No domain data available" description="Crawl websites to see which domains are most frequently targeted." />
          )}
        </ChartCard>

        <ChartCard title="Website Performance" description="Response speed and blocking status" className="lg:col-span-1">
          <div className="space-y-3">
            {MOCK_HEATMAP.map((h) => {
              const styles = {
                fast: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Fast" },
                moderate: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Moderate" },
                slow: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500", label: "Slow" },
                blocked: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500", label: "Blocked" },
              };
              const s = styles[h.status];
              return (
                <div key={h.domain} className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
                  <span className="text-sm font-medium text-gray-900">{h.domain}</span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </ChartCard>

        <ChartCard title="Error Analysis" description="Root causes of crawl failures" className="lg:col-span-1">
          {data.errors.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.errors} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                  {data.errors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState icon={<AlertCircle className="h-6 w-6" />} title="No error data available" description="When crawls fail, error patterns will appear here for analysis." />
          )}
        </ChartCard>
      </div>

      <div className="mt-6">
        <ChartCard title="Content Analytics" description="Structured data extracted from crawls">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            <ContentStat icon={<FileText className="h-5 w-5" />} label="Pages" value={(data.contentStats?.pages ?? 0).toLocaleString()} color="blue" />
            <ContentStat icon={<TableIcon className="h-5 w-5" />} label="Tables" value={(data.contentStats?.tables ?? 0).toLocaleString()} color="violet" />
            <ContentStat icon={<Mail className="h-5 w-5" />} label="Emails" value={(data.contentStats?.emails ?? 0).toLocaleString()} color="emerald" />
            <ContentStat icon={<Phone className="h-5 w-5" />} label="Phones" value={(data.contentStats?.phones ?? 0).toLocaleString()} color="amber" />
            <ContentStat icon={<File className="h-5 w-5" />} label="PDFs" value={(data.contentStats?.pdfs ?? 0).toLocaleString()} color="rose" />
            <ContentStat icon={<Link2 className="h-5 w-5" />} label="Links" value={data.contentStats ? `${((data.contentStats.links ?? 0) / 1000).toFixed(1)}K` : "0"} color="indigo" />
            <ContentStat icon={<Server className="h-5 w-5" />} label="Images" value={(data.contentStats?.images ?? 0).toLocaleString()} color="cyan" />
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════

function ChartEmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400 ring-1 ring-gray-200/60">
        {icon}
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-gray-500">{description}</p>
    </div>
  );
}

function KPICard({ icon, label, value, trend, color }: { icon: React.ReactNode; label: string; value: string; trend: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500 to-indigo-600", emerald: "from-emerald-500 to-teal-600", amber: "from-amber-500 to-orange-600",
    violet: "from-violet-500 to-purple-600", fuchsia: "from-fuchsia-500 to-pink-600", indigo: "from-indigo-500 to-blue-600",
  };
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <TrendingUp className="h-3 w-3" /> {trend}
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${colorMap[color]} text-white shadow-md`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

function ChartCard({ title, description, children, className = "" }: { title: string; description: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ${className}`}>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      {children}
    </motion.div>
  );
}

function ContentStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600", violet: "bg-violet-50 text-violet-600", emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600", rose: "bg-rose-50 text-rose-600", indigo: "bg-indigo-50 text-indigo-600", cyan: "bg-cyan-50 text-cyan-600",
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
      <div className="mb-8 flex justify-between">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-gray-100" />
        <div className="flex gap-2">
          <div className="h-10 w-32 animate-pulse rounded-xl bg-gray-100" />
          <div className="h-10 w-24 animate-pulse rounded-xl bg-gray-100" />
        </div>
      </div>
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
          <div className="grid grid-cols-2 gap-6">
            <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
            <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
          </div>
        </div>
        <div className="h-full min-h-[400px] animate-pulse rounded-2xl bg-gray-100" />
      </div>
    </div>
  );
}