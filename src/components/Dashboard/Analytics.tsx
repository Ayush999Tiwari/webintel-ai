"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { DailyCrawlPoint, EngineUsage, CrawlRecord } from "@/types";

const PIE_COLORS = ["#6366F1", "#8B5CF6", "#A855F7", "#22C55E", "#F59E0B"];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
  fontSize: 12,
  padding: "8px 12px",
};

interface AnalyticsProps {
  dailyCrawls: DailyCrawlPoint[];
  engineUsage: EngineUsage[];
  history: CrawlRecord[];
  isLoading: boolean;
}

export function Analytics({ dailyCrawls, engineUsage, history, isLoading }: AnalyticsProps) {
  const successRateData = buildSuccessRateSeries(history);

  const crawlTrend = useMemo(() => calculateTrend(dailyCrawls), [dailyCrawls]);
  const healthScore = useMemo(() => calculateHealthScore(history), [history]);
  const avgResponseTime = useMemo(() => calculateAvgResponseTime(history), [history]);
  const uptimePercent = useMemo(() => calculateUptime(history), [history]);
  const heatmapData = useMemo(() => buildHeatmapData(history), [history]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 animate-pulse rounded-xl bg-gray-100" />
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-32 animate-pulse rounded bg-gray-50" />
              </div>
            </div>
            <div className="mt-6 h-56 w-full animate-pulse rounded-xl bg-gray-50" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes gaugeFill {
          from { stroke-dashoffset: 502.65; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes countUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes cellFadeIn {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 1; transform: scale(1); }
        }
        .gauge-animate { animation: gaugeFill 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        .count-up { animation: countUp 0.5s ease-out forwards; }
        .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08); }
        .heatmap-cell { transition: all 0.2s ease; transform-origin: center; }
        .heatmap-cell:hover { transform: scale(1.4); filter: brightness(1.15); z-index: 10; }
      `}</style>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* ─── Crawl Activity Heatmap (Grafana-style) ─── */}
        <HeatmapCard data={heatmapData} />

        {/* ─── Engine Usage ─── */}
        <ChartCard
          title="Engine Usage"
          description="Distribution of crawls by engine"
          accent="violet"
        >
          <div className="flex h-full items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Pie
                  data={engineUsage}
                  dataKey="count"
                  nameKey="engine"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {engineUsage.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {engineUsage.map((entry, i) => (
              <div key={entry.engine} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="text-xs text-gray-500">{entry.engine}</span>
                <span className="text-xs font-semibold text-gray-700">{entry.count}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* ─── Success Rate ─── */}
        <ChartCard
          title="Success Rate"
          description="Successful vs. failed crawls per day"
          accent="emerald"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={successRateData} barGap={2}>
              <defs>
                <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity={1} />
                  <stop offset="100%" stopColor="#16A34A" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="failedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F87171" stopOpacity={1} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="success" stackId="a" fill="url(#successGrad)" />
              <Bar dataKey="failed" stackId="a" fill="url(#failedGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ─── System Health ─── */}
        <HealthScoreCard
          score={healthScore}
          avgResponse={avgResponseTime}
          uptime={uptimePercent}
          trend={crawlTrend}
        />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   CRAWL ACTIVITY HEATMAP (Grafana-style)
   ═══════════════════════════════════════════════════════════ */

function HeatmapCard({ data }: { data: HeatmapCell[] }) {
  const maxCount = Math.max(1, ...data.map((d) => d.count));
  const totalCrawls = data.reduce((s, d) => s + d.count, 0);
  const activeDays = data.filter((d) => d.count > 0).length;
  const peakDay = data.reduce(
    (max, d) => (d.count > max.count ? d : max),
    { count: 0, date: "", day: 0, label: "" } as HeatmapCell
  );

  // Group by week columns (7 rows = days of week)
  const weeks = groupByWeeks(data);

  const dayLabels = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

  return (
    <div className="card-hover fade-in-up relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Decorative gradient */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/5 blur-3xl" />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Crawl Activity</h3>
              <p className="text-xs text-gray-400">Daily intensity · last 14 weeks</p>
            </div>
          </div>

          {/* Summary badge */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900 count-up">
                {totalCrawls.toLocaleString()}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-gray-400">Total</p>
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="mt-5">
          <div className="flex gap-1.5">
            {/* Day labels */}
            <div className="flex flex-col justify-between py-0.5 pr-1">
              {dayLabels.map((label, i) => (
                <div
                  key={i}
                  className="flex h-[14px] items-center text-[10px] font-medium text-gray-400"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Cells grid */}
            <div className="flex flex-1 gap-[3px] overflow-hidden">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-1 flex-col gap-[3px]">
                  {week.map((cell, di) => {
                    const intensity = cell.count / maxCount;
                    const color = getHeatColor(intensity);
                    const delay = (wi * 7 + di) * 8;
                    return (
                      <div
                        key={di}
                        className="heatmap-cell group relative h-[14px] cursor-pointer rounded-[3px]"
                        style={{
                          backgroundColor: color,
                          animation: `cellFadeIn 0.3s ease-out ${delay}ms both`,
                        }}
                        title={`${cell.label}: ${cell.count} crawls`}
                      >
                        {/* Tooltip on hover */}
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-gray-100 bg-white px-2.5 py-1.5 text-[11px] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                          <p className="font-semibold text-gray-900">{cell.label}</p>
                          <p className="text-gray-500">
                            <span className="font-bold text-indigo-600">{cell.count}</span> crawls
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-[11px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>
                  Peak: <span className="font-semibold text-gray-700">{peakDay.count}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>
                  Active days: <span className="font-semibold text-gray-700">{activeDays}</span>
                </span>
              </div>
            </div>

            {/* Color scale */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400">Less</span>
              {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
                <div
                  key={i}
                  className="h-2.5 w-2.5 rounded-[2px]"
                  style={{ backgroundColor: getHeatColor(v) }}
                />
              ))}
              <span className="text-[10px] text-gray-400">More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HEALTH SCORE CARD
   ═══════════════════════════════════════════════════════════ */

function HealthScoreCard({
  score,
  avgResponse,
  uptime,
  trend,
}: {
  score: number;
  avgResponse: number;
  uptime: number;
  trend: number;
}) {
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (score / 100) * circumference;
  const { label, gradientFrom, gradientTo, bgClass } = getScoreMeta(score);
  const isPositive = trend >= 0;

  return (
    <div className="card-hover fade-in-up relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div
        className="absolute -right-12 -top-12 h-40 w-40 rounded-full blur-2xl"
        style={{
          background: `radial-gradient(circle, ${gradientFrom}15, ${gradientTo}08)`,
        }}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                boxShadow: `0 8px 24px ${gradientFrom}40`,
              }}
            >
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">System Health</p>
              <p className="text-xs text-gray-400">Overall performance</p>
            </div>
          </div>
          <div
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
          >
            <svg className={`h-3 w-3 ${isPositive ? "" : "rotate-180"}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            {Math.abs(trend).toFixed(1)}%
          </div>
        </div>

        {/* Gauge */}
        <div className="mt-5 flex flex-col items-center">
          <div className="relative h-44 w-44">
            <svg viewBox="0 0 200 200" className="h-full w-full">
              <defs>
                <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={gradientFrom} />
                  <stop offset="100%" stopColor={gradientTo} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle cx="100" cy="100" r="80" fill="none" stroke="#F3F4F6" strokeWidth="14" />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="url(#healthGrad)"
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
                className="gauge-animate"
                filter="url(#glow)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-900 count-up">{score}</span>
              <span
                className="mt-0.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{ color: gradientFrom, backgroundColor: `${gradientFrom}15` }}
              >
                {label}
              </span>
            </div>
          </div>

          {/* Sub metrics */}
          <div className="mt-4 grid w-full grid-cols-2 gap-3">
            <div className={`rounded-xl ${bgClass} p-3.5 text-center`}>
              <p className="text-xl font-bold text-gray-900">
                {avgResponse}
                <span className="text-sm font-medium text-gray-400">ms</span>
              </p>
              <p className="mt-0.5 text-xs text-gray-500">Avg Response</p>
            </div>
            <div className={`rounded-xl ${bgClass} p-3.5 text-center`}>
              <p className="text-xl font-bold text-gray-900">
                {uptime}
                <span className="text-sm font-medium text-gray-400">%</span>
              </p>
              <p className="mt-0.5 text-xs text-gray-500">Uptime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CHART CARD
   ═══════════════════════════════════════════════════════════ */

function ChartCard({
  title,
  description,
  children,
  accent = "blue",
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  accent?: "blue" | "emerald" | "violet" | "amber";
}) {
  const accentMap = {
    blue: { iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600", iconShadow: "shadow-blue-500/25" },
    emerald: { iconBg: "bg-gradient-to-br from-emerald-500 to-green-600", iconShadow: "shadow-emerald-500/25" },
    violet: { iconBg: "bg-gradient-to-br from-violet-500 to-purple-600", iconShadow: "shadow-violet-500/25" },
    amber: { iconBg: "bg-gradient-to-br from-amber-500 to-orange-600", iconShadow: "shadow-amber-500/25" },
  };
  const a = accentMap[accent];

  const iconPaths: Record<string, string> = {
    blue: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    emerald: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    violet: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
    amber: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  };

  return (
    <div className="card-hover fade-in-up relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${a.iconBg} shadow-lg ${a.iconShadow}`}>
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[accent]} />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-400">{description}</p>
          </div>
        </div>
        <div className="mt-4 h-64">{children}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TYPES & HELPERS
   ═══════════════════════════════════════════════════════════ */

interface HeatmapCell {
  date: string;
  day: number; // 0=Sun ... 6=Sat
  count: number;
  label: string;
}

function buildHeatmapData(history: CrawlRecord[]): HeatmapCell[] {
  const map = new Map<string, { date: Date; count: number }>();

  // Initialize last 14 weeks (98 days)
  const now = new Date();
  for (let i = 97; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, { date: d, count: 0 });
  }

  history.forEach((h) => {
    const d = new Date(h.createdAt);
    const key = d.toISOString().slice(0, 10);
    const entry = map.get(key);
    if (entry) entry.count += 1;
  });

  return Array.from(map.entries()).map(([key, val]) => ({
    date: key,
    day: val.date.getDay(),
    count: val.count,
    label: val.date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));
}

function groupByWeeks(data: HeatmapCell[]): HeatmapCell[][] {
  // Reorder so week starts on Sunday, rows: Sun(0) → Sat(6)
  const weeks: HeatmapCell[][] = [];
  let currentWeek: HeatmapCell[] = [];

  data.forEach((cell) => {
    currentWeek.push(cell);
    if (cell.day === 6 || currentWeek.length === 7) {
      // Pad to 7 if needed
      while (currentWeek.length < 7) {
        currentWeek.push({ date: "", day: currentWeek.length, count: 0, label: "" });
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: "", day: currentWeek.length, count: 0, label: "" });
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

function getHeatColor(intensity: number): string {
  if (intensity === 0) return "#F3F4F6"; // gray-100
  if (intensity < 0.25) return "#C7D2FE"; // indigo-200
  if (intensity < 0.5) return "#818CF8"; // indigo-400
  if (intensity < 0.75) return "#6366F1"; // indigo-500
  return "#4338CA"; // indigo-700
}

function getScoreMeta(score: number) {
  if (score >= 90)
    return { label: "Excellent", gradientFrom: "#10B981", gradientTo: "#059669", bgClass: "bg-emerald-50/70" };
  if (score >= 70)
    return { label: "Good", gradientFrom: "#3B82F6", gradientTo: "#2563EB", bgClass: "bg-blue-50/70" };
  if (score >= 50)
    return { label: "Fair", gradientFrom: "#F59E0B", gradientTo: "#D97706", bgClass: "bg-amber-50/70" };
  return { label: "Poor", gradientFrom: "#EF4444", gradientTo: "#DC2626", bgClass: "bg-red-50/70" };
}

function calculateTrend(dailyCrawls: DailyCrawlPoint[]): number {
  if (dailyCrawls.length < 2) return 0;
  const mid = Math.floor(dailyCrawls.length / 2);
  const firstHalf = dailyCrawls.slice(0, mid).reduce((s, d) => s + d.crawls, 0);
  const secondHalf = dailyCrawls.slice(mid).reduce((s, d) => s + d.crawls, 0);
  if (firstHalf === 0) return secondHalf > 0 ? 100 : 0;
  return ((secondHalf - firstHalf) / firstHalf) * 100;
}

function calculateHealthScore(history: CrawlRecord[]): number {
  if (history.length === 0) return 0;
  const successCount = history.filter((h) => h.status === "success").length;
  const successRate = (successCount / history.length) * 100;
  const avgLength =
    history.reduce((sum, h) => {
      const len = typeof h.contentLength === "number" && !isNaN(h.contentLength) ? h.contentLength : 0;
      return sum + Math.min(len / 200, 4000);
    }, 0) / history.length;
  const responseScore = Math.max(0, 100 - avgLength / 40);
  return Math.round(successRate * 0.7 + responseScore * 0.3);
}

function calculateAvgResponseTime(history: CrawlRecord[]): number {
  if (history.length === 0) return 0;
  const total = history.reduce((sum, h) => {
    const len = typeof h.contentLength === "number" && !isNaN(h.contentLength) ? h.contentLength : 0;
    return sum + Math.min(len / 200, 4000);
  }, 0);
  return Math.round(total / history.length);
}

function calculateUptime(history: CrawlRecord[]): number {
  if (history.length === 0) return 0;
  const successCount = history.filter((h) => h.status === "success").length;
  return Math.round((successCount / history.length) * 100);
}

function buildSuccessRateSeries(history: CrawlRecord[]) {
  const map = new Map<string, { date: string; success: number; failed: number }>();
  history.forEach((h) => {
    const day = new Date(h.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const entry = map.get(day) ?? { date: day, success: 0, failed: 0 };
    if (h.status === "success") entry.success += 1;
    if (h.status === "failed") entry.failed += 1;
    map.set(day, entry);
  });
  return Array.from(map.values()).slice(-14);
}
