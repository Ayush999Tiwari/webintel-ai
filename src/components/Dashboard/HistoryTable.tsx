"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ExternalLink, RefreshCcw, Inbox, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/Dashboard/StatusBadge";
import { formatBytes, formatDateTime } from "@/lib/utils";
import type { CrawlRecord } from "@/types";

interface HistoryTableProps {
  data: CrawlRecord[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onStartFirstCrawl: () => void;
}

export function HistoryTable({ data, isLoading, isError, onRetry, onStartFirstCrawl }: HistoryTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="p-6 pb-3">
        <h3 className="text-base font-semibold text-gray-900">Recent Crawl History</h3>
        <p className="text-sm text-gray-500">Latest websites processed by your engines</p>
      </div>
      <div className="px-6 pb-6">
        {isError ? (
          <ErrorState onRetry={onRetry} />
        ) : isLoading ? (
          <LoadingRows />
        ) : data.length === 0 ? (
          <EmptyState onStartFirstCrawl={onStartFirstCrawl} />
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Status", "Website", "Actions", "Engine", "Content Length", "Created At"].map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 ${
                        h === "Actions" ? "text-center" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[320px]">
                        <div className="truncate font-medium text-gray-900">
                          {row.title || "Untitled"}
                        </div>
                        <a
                          href={row.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 block truncate text-xs text-blue-600 hover:text-blue-800 hover:underline"
                          title={row.url}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {row.url}
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button
                          onClick={() => router.push(`/dashboard/scrape/${row.id}`)}
                          aria-label={`View scrape results for ${row.title || row.url}`}
                          title="View scraped content"
                          className="group relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 ring-1 ring-indigo-100 transition-all hover:from-indigo-100 hover:to-purple-100 hover:text-indigo-700 hover:ring-indigo-200 hover:shadow-md hover:shadow-indigo-500/10"
                        >
                          <ExternalLink className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                            View Results
                          </span>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{row.engine}</td>
                    <td className="px-4 py-3 text-gray-500">{formatBytes(row.contentLength)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDateTime(row.createdAt)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3 py-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
          </div>
          <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onStartFirstCrawl }: { onStartFirstCrawl: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50">
        <Inbox className="h-7 w-7 text-blue-600" />
      </div>
      <div>
        <p className="text-base font-semibold text-gray-900">No crawls yet</p>
        <p className="mt-1 text-sm text-gray-500">Your crawl history will show up here once you run one.</p>
      </div>
      <button
        onClick={onStartFirstCrawl}
        className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-600 hover:shadow-blue-500/25"
      >
        Start your first crawl
      </button>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-red-100 bg-red-50/50 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
        <AlertTriangle className="h-6 w-6 text-red-600" />
      </div>
      <div>
        <p className="text-base font-semibold text-gray-900">Couldn&apos;t load crawl history</p>
        <p className="mt-1 text-sm text-gray-500">Check that the API server is running and try again.</p>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
      >
        <RefreshCcw className="h-4 w-4" />
        Retry
      </button>
    </div>
  );
}