"use client";

import { motion } from "framer-motion";
import {
  Globe,
  CheckCircle2,
  XCircle,
  FileText,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

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
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

export default function DashboardPage() {
  const {
    stats,
    recentHistory,
    history,
    dailyCrawls,
    engineUsage,
    isLoading,
    isError,
    refetch,
  } = useHistory();

  const activityEvents = recentHistory.map((h) => ({
    id: h.id,
    website: h.website,
    status: h.status,
    createdAt: h.createdAt,
  }));

  function scrollToCrawlForm() {
    document
      .getElementById("new-crawl")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Dashboard Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          A live overview of your crawling activity across every engine.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Total Crawls"
          value={stats.totalCrawls}
          icon={Globe}
          color="blue"
          trend={12}
          index={0}
        />

        <StatsCard
          label="Successful Crawls"
          value={stats.successfulCrawls}
          icon={CheckCircle2}
          color="emerald"
          trend={8}
          index={1}
        />

        <StatsCard
          label="Failed Crawls"
          value={stats.failedCrawls}
          icon={XCircle}
          color="purple"
          trend={-3}
          index={2}
        />

        <StatsCard
          label="Avg. Content Size"
          value={stats.averageContentSize}
          icon={FileText}
          color="indigo"
          formatValue={formatBytes}
          index={3}
        />
      </div>

      {/* New Crawl Form */}
      <div id="new-crawl">
        <CrawlForm />
      </div>

      {/* Recent History and Activity */}
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

        <ActivityTimeline
          events={activityEvents}
          isLoading={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* AI Chat Integration */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-5 shadow-sm sm:p-6"
      >
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-1/3 h-40 w-40 rounded-full bg-violet-100/50 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
              <MessageCircle size={24} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-gray-900">
                  Chat with your scraped data
                </h2>

                <span className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-white px-2.5 py-1 text-xs font-medium text-indigo-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  AI Assistant
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Ask questions about your indexed websites, summarize extracted
                content, and explore information using AI-powered search across
                your scraped data.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-xs font-medium text-indigo-700">
                  Retrieval-Augmented Generation
                </span>

                <span className="rounded-full border border-violet-100 bg-white/80 px-3 py-1 text-xs font-medium text-violet-700">
                  Source-backed answers
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/chat"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-200"
          >
            Open AI Chat
            <ArrowRight size={17} />
          </Link>
        </div>
      </motion.section>

      {/* Analytics */}
      <Analytics
        dailyCrawls={dailyCrawls}
        engineUsage={engineUsage}
        history={history}
        isLoading={isLoading}
      />
    </motion.div>
  );
}