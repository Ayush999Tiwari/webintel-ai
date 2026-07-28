// src/app/dashboard/scrape/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Link2,
  AlertCircle,
  Globe,
  Hash,
  Sparkles,
  Database,
  Clock,
  Share2,
  Cpu,
} from "lucide-react";
import { StatusBadge } from "@/components/Dashboard/StatusBadge";
import { formatBytes, formatDateTime } from "@/lib/utils";
import type { CrawlStatus } from "@/types";

interface ScrapeDetail {
  id: number;
  url: string;
  status: string;
  engine_used: string;
  title: string;
  content: string;
  content_length: number;
  metadata: any;
  links: string[];
  error_message: string | null;
  created_at: string;
}

export default function ScrapeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scrapeId = params.id as string;

  const [scrape, setScrape] = useState<ScrapeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "metadata" | "links">("content");

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:8000/scrape/${scrapeId}`);
        if (!res.ok) throw new Error(`Failed to load scrape (status ${res.status})`);
        const data: ScrapeDetail = await res.json();
        setScrape(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [scrapeId]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !scrape) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/40 to-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </button>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-rose-50/50 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/25">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">Failed to load scrape</h2>
            <p className="mt-1 text-sm text-gray-600">{error || "Scrape not found"}</p>
            <button
              onClick={() => router.back()}
              className="mt-6 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const domain = getDomain(scrape.url);
  const metadataEntries = scrape.metadata && typeof scrape.metadata === "object"
    ? Object.entries(scrape.metadata)
    : [];
  const linksCount = scrape.links?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/40 to-white">
      <style jsx global>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
        }
        .gradient-animate {
          background-size: 200% 200%;
          animation: gradientShift 8s ease infinite;
        }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 flex items-center justify-between"
        >
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:shadow"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(scrape.url)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy URL"}
            </button>
            <button
              onClick={() => window.open(scrape.url, "_blank")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:shadow-lg hover:shadow-indigo-500/40"
            >
              <ExternalLink className="h-4 w-4" />
              Open Original
            </button>
          </div>
        </motion.div>

        {/* Hero Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
        >
          <div className="gradient-animate absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-purple-500/5" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-400/10 to-purple-400/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-br from-violet-400/10 to-pink-400/10 blur-3xl" />

          <div className="relative p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-5 min-w-0 flex-1">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 text-2xl font-bold text-white shadow-xl shadow-indigo-500/30 ring-4 ring-white">
                  {domain.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <StatusBadge status={scrape.status as CrawlStatus} />
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      <Cpu className="h-3 w-3" />
                      {scrape.engine_used}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      <Hash className="h-3 w-3" />
                      #{scrape.id}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    {scrape.title || "Untitled Scrape"}
                  </h1>
                  <a
                    href={scrape.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline group"
                  >
                    <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{scrape.url}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                icon={<FileText className="h-4 w-4" />}
                label="Content Size"
                value={formatBytes(scrape.content_length)}
                gradient="from-blue-500 to-indigo-600"
              />
              <StatCard
                icon={<Link2 className="h-4 w-4" />}
                label="Links Found"
                value={linksCount.toString()}
                gradient="from-emerald-500 to-teal-600"
              />
              <StatCard
                icon={<Database className="h-4 w-4" />}
                label="Metadata Keys"
                value={metadataEntries.length.toString()}
                gradient="from-violet-500 to-purple-600"
              />
              <StatCard
                icon={<Clock className="h-4 w-4" />}
                label="Created"
                value={formatDateTime(scrape.created_at)}
                gradient="from-amber-500 to-orange-600"
                small
              />
            </div>
          </div>
        </motion.div>

        {/* Error Banner */}
        {scrape.error_message && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-5 overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-red-50/50"
          >
            <div className="flex items-start gap-4 p-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-md shadow-rose-500/25">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-rose-900">Crawl Error</h3>
                <p className="mt-1 text-sm text-rose-700">{scrape.error_message}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-5 rounded-2xl border border-gray-100 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-6 pt-4">
            <div className="flex gap-1">
              <TabButton
                active={activeTab === "content"}
                onClick={() => setActiveTab("content")}
                icon={<FileText className="h-4 w-4" />}
                label="Content"
                count={scrape.content?.length || 0}
              />
              <TabButton
                active={activeTab === "metadata"}
                onClick={() => setActiveTab("metadata")}
                icon={<Database className="h-4 w-4" />}
                label="Metadata"
                count={metadataEntries.length}
              />
              <TabButton
                active={activeTab === "links"}
                onClick={() => setActiveTab("links")}
                icon={<Link2 className="h-4 w-4" />}
                label="Links"
                count={linksCount}
              />
            </div>

            {activeTab === "content" && scrape.content && (
              <button
                onClick={() => handleCopy(scrape.content)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy All
                  </>
                )}
              </button>
            )}
          </div>

          <div className="p-6">
            {activeTab === "content" && (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {scrape.content ? (
                  <div className="relative">
                    <div className="max-h-[600px] overflow-y-auto rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50/50 to-white p-6 scrollbar-thin">
                      <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-gray-800">
                        {scrape.content}
                      </pre>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                        {scrape.content.length.toLocaleString()} characters
                      </span>
                      <span>{formatBytes(scrape.content_length)}</span>
                    </div>
                  </div>
                ) : (
                  <EmptyTab
                    icon={<FileText className="h-6 w-6" />}
                    title="No content available"
                    description="This scrape did not capture any content."
                  />
                )}
              </motion.div>
            )}

            {activeTab === "metadata" && (
              <motion.div
                key="metadata"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {metadataEntries.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {metadataEntries.map(([key, value], idx) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.03 }}
                        className="group rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50/50 p-4 transition hover:border-indigo-200 hover:shadow-sm"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          {key}
                        </p>
                        <p className="mt-1.5 break-words text-sm font-medium text-gray-900">
                          {typeof value === "object" ? (
                            <pre className="whitespace-pre-wrap font-mono text-xs text-gray-700">
                              {JSON.stringify(value, null, 2)}
                            </pre>
                          ) : (
                            String(value)
                          )}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <EmptyTab
                    icon={<Database className="h-6 w-6" />}
                    title="No metadata captured"
                    description="This scrape did not include any metadata."
                  />
                )}
              </motion.div>
            )}

            {activeTab === "links" && (
              <motion.div
                key="links"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {linksCount > 0 ? (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold text-gray-900">{linksCount}</span> links extracted from this page
                      </p>
                      <button
                        onClick={() => handleCopy(scrape.links.join("\n"))}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy All Links
                      </button>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto rounded-xl border border-gray-200 bg-white scrollbar-thin">
                      {scrape.links.map((link, idx) => (
                        <motion.a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.5) }}
                          className="group flex items-center gap-3 border-b border-gray-50 px-4 py-3 transition hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 last:border-b-0"
                        >
                          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-gray-50 to-gray-100 text-[10px] font-bold text-gray-500 ring-1 ring-gray-200/60">
                            {idx + 1}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm text-blue-600 group-hover:text-blue-800 group-hover:underline">
                            {link}
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-gray-300 transition group-hover:text-gray-600" />
                        </motion.a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyTab
                    icon={<Link2 className="h-6 w-6" />}
                    title="No links extracted"
                    description="No external or internal links were found in this scrape."
                  />
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  gradient,
  small,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
  small?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 transition hover:border-gray-200 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white shadow-md`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            {label}
          </p>
          <p className={`mt-0.5 truncate font-bold text-gray-900 ${small ? "text-xs" : "text-base"}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold transition ${
        active ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
      }`}
    >
      {icon}
      {label}
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
        active ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"
      }`}>
        {count}
      </span>
      {active && (
        <motion.span
          layoutId="activeTab"
          className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600"
        />
      )}
    </button>
  );
}

function EmptyTab({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
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

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/40 to-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-10 w-24 animate-pulse rounded-xl bg-gray-100" />
          <div className="flex gap-2">
            <div className="h-10 w-28 animate-pulse rounded-xl bg-gray-100" />
            <div className="h-10 w-36 animate-pulse rounded-xl bg-gray-100" />
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-5">
            <div className="h-16 w-16 animate-pulse rounded-2xl bg-gray-100" />
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
                <div className="h-6 w-24 animate-pulse rounded-full bg-gray-100" />
                <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
              </div>
              <div className="h-8 w-3/4 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="h-96 animate-pulse rounded-xl bg-gray-100" />
        </div>
      </div>
    </div>
  );
}