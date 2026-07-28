"use client";

import { motion } from "framer-motion";
import { formatRelativeTime, cn } from "@/lib/utils";
import type { CrawlStatus } from "@/types";

const DOT_COLOR: Record<CrawlStatus, string> = {
  success: "bg-green-500",
  running: "bg-blue-500",
  failed: "bg-red-500",
  pending: "bg-amber-500",
};

const VERB: Record<CrawlStatus, string> = {
  success: "scraped successfully",
  running: "is being crawled",
  failed: "failed to crawl",
  pending: "queued for crawl",
};

interface ActivityEvent {
  id: string;
  website: string;
  status: CrawlStatus;
  createdAt: string;
}

export function ActivityTimeline({ events, isLoading }: { events: ActivityEvent[]; isLoading: boolean }) {
  return (
    <div className="h-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
      <p className="text-sm text-gray-500">Live feed of crawl events</p>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-gray-100" />
                <div className="h-4 flex-1 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No activity yet — run a crawl to see it here.</p>
        ) : (
          <ol className="relative space-y-5 border-l border-gray-100 pl-5">
            {events.map((event, i) => (
              <motion.li
                key={event.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="relative"
              >
                <span
                  className={cn(
                    "absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white",
                    DOT_COLOR[event.status]
                  )}
                />
                <p className="text-sm font-medium text-gray-900">
                  {event.website} <span className="font-normal text-gray-500">{VERB[event.status]}</span>
                </p>
                <p className="text-xs text-gray-400">{formatRelativeTime(event.createdAt)}</p>
              </motion.li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
