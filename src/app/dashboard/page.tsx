"use client";

import { motion } from "framer-motion";
import { Globe, CheckCircle2, XCircle, FileText } from "lucide-react";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { HistoryTable } from "@/components/Dashboard/HistoryTable";
import { ActivityTimeline } from "@/components/Dashboard/ActivityTimeline";
import { Analytics } from "@/components/Dashboard/Analytics";
import { CrawlForm } from "@/components/Dashboard/CrawlForm";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { useHistory } from "@/hooks/useHistory";
import { formatBytes } from "@/lib/utils";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export default function DashboardPage() {
  const { stats, recentHistory, history, dailyCrawls, engineUsage, isLoading, isError, refetch } = useHistory();
  const activityEvents = recentHistory.map((h) => ({
    id: h.id,
    website: h.website,
    status: h.status,
    createdAt: h.createdAt,
  }));

  function scrollToCrawlForm() {
    document.getElementById("new-crawl")?.scrollIntoView({ behavior: "smooth" });
  }
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">A live overview of your crawling activity across every engine.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total Crawls" value={stats.totalCrawls} icon={Globe} color="blue" trend={12} index={0} />
        <StatsCard
          label="Successful Crawls"
          value={stats.successfulCrawls}
          icon={CheckCircle2}
          color="emerald"
          trend={8}
          index={1}
        />
        <StatsCard label="Failed Crawls" value={stats.failedCrawls} icon={XCircle} color="purple" trend={-3} index={2} />
        <StatsCard
          label="Avg. Content Size"
          value={stats.averageContentSize}
          icon={FileText}
          color="indigo"
          formatValue={formatBytes}
          index={3}
        />
      </div>

      <div id="new-crawl">
        <CrawlForm />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HistoryTable
            data={recentHistory}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
            onStartFirstCrawl={scrollToCrawlForm}
          />
        </div>
        <ActivityTimeline events={activityEvents} isLoading={isLoading} />
      </div>

      <QuickActions />

      <Analytics dailyCrawls={dailyCrawls} engineUsage={engineUsage} history={history} isLoading={isLoading} />
    </motion.div>
  );
}
