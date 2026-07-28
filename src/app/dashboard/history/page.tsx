"use client";

import { useEffect, useMemo, useState, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════ */

type Status = "success" | "failed" | "running" | "pending" | "partial";
type SortKey = "created_at" | "url" | "status" | "engine" | "content_length";
type SortDir = "asc" | "desc";

interface CrawlRecord {
  id: number | string;
  url: string;
  status: string;
  engine: string;
  title: string;
  contentLength: number;
  createdAt: string;
}

interface RawCrawlRecord {
  id: number | string;
  url: string;
  status: string;
  engine_used?: string;
  title?: string | null;
  content_length?: number;
  created_at: string;
}

/* ═══════════════════════════════════════════════════════════
   NORMALIZE API RESPONSE → CrawlRecord
   ═══════════════════════════════════════════════════════════ */

function normalizeRecord(raw: RawCrawlRecord): CrawlRecord {
  return {
    id: raw.id,
    url: raw.url,
    status: raw.status,
    engine: raw.engine_used ?? "",
    title: raw.title ?? "",
    contentLength: raw.content_length ?? 0,
    createdAt: raw.created_at,
  };
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */

export default function HistoryPage() {
  const [history, setHistory] = useState<CrawlRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [engineFilter, setEngineFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedRecord, setSelectedRecord] = useState<CrawlRecord | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/history");
      if (!res.ok) throw new Error(`Failed to fetch history (${res.status})`);
      const data: RawCrawlRecord[] = await res.json();
      const normalized = (Array.isArray(data) ? data : []).map(normalizeRecord);
      setHistory(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, engineFilter, sortKey, sortDir]);

  const engines = useMemo(
    () => Array.from(new Set(history.map((h) => h.engine).filter(Boolean))),
    [history]
  );

  const filtered = useMemo(() => {
    let out = history;
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (r) =>
          r.url?.toLowerCase().includes(q) ||
          r.title?.toLowerCase().includes(q) ||
          r.engine?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") out = out.filter((r) => r.status === statusFilter);
    if (engineFilter !== "all") out = out.filter((r) => r.engine === engineFilter);

    out = [...out].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "created_at") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortKey === "content_length") {
        cmp = (a.contentLength || 0) - (b.contentLength || 0);
      } else if (sortKey === "url") {
        cmp = (a.url || "").toLowerCase().localeCompare((b.url || "").toLowerCase());
      } else if (sortKey === "status") {
        cmp = (a.status || "").toLowerCase().localeCompare((b.status || "").toLowerCase());
      } else if (sortKey === "engine") {
        cmp = (a.engine || "").toLowerCase().localeCompare((b.engine || "").toLowerCase());
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return out;
  }, [history, search, statusFilter, engineFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes shimmer { 0% { background-position: -400px 0 } 100% { background-position: 400px 0 } }
        .fade-in { animation: fadeIn 0.3s ease-out }
        .slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) }
        .shimmer { background: linear-gradient(90deg, #f3f4f6 0px, #e5e7eb 40px, #f3f4f6 80px); background-size: 800px 100%; animation: shimmer 1.4s linear infinite; }
        .row-hover { transition: background-color 0.15s ease; }
        .row-hover:hover { background-color: #F9FAFB; }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
      `}</style>

      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <PageHeader onRefresh={fetchHistory} isLoading={isLoading} total={history.length} />

          <FilterBar
            search={search}
            onSearch={setSearch}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            engineFilter={engineFilter}
            onEngineFilter={setEngineFilter}
            engines={engines}
            resultCount={filtered.length}
            totalCount={history.length}
          />

          {error ? (
            <ErrorState message={error} onRetry={fetchHistory} />
          ) : isLoading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState hasFilters={!!(search || statusFilter !== "all" || engineFilter !== "all")} />
          ) : (
            <DataTable
              data={pageData}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
              onRowClick={setSelectedRecord}
            />
          )}

          {!isLoading && !error && filtered.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              total={filtered.length}
              pageSize={pageSize}
            />
          )}
        </div>
      </div>

      {selectedRecord && (
        <DetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE HEADER
   ═══════════════════════════════════════════════════════════ */

function PageHeader({ onRefresh, isLoading, total }: { onRefresh: () => void; isLoading: boolean; total: number }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 shadow-lg shadow-indigo-500/25">
          <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Crawl History</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/10">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Complete log of every crawl execution · <span className="font-semibold text-gray-700">{total.toLocaleString()}</span> total records
          </p>
        </div>
      </div>

      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:shadow disabled:opacity-50"
      >
        <svg
          className={`h-4 w-4 transition-transform group-hover:rotate-180 ${isLoading ? "animate-spin" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FILTER BAR
   ═══════════════════════════════════════════════════════════ */

function FilterBar({
  search, onSearch,
  statusFilter, onStatusFilter,
  engineFilter, onEngineFilter,
  engines, resultCount, totalCount,
}: {
  search: string; onSearch: (v: string) => void;
  statusFilter: "all" | Status; onStatusFilter: (v: "all" | Status) => void;
  engineFilter: string; onEngineFilter: (v: string) => void;
  engines: string[]; resultCount: number; totalCount: number;
}) {
  const statuses: { value: "all" | Status; label: string; icon: string }[] = [
    { value: "all", label: "All", icon: "M4 6h16M4 12h16M4 18h16" },
    { value: "success", label: "Success", icon: "M5 13l4 4L19 7" },
    { value: "failed", label: "Failed", icon: "M6 18L18 6M6 6l12 12" },
    { value: "partial", label: "Partial", icon: "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { value: "running", label: "Running", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    { value: "pending", label: "Pending", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  const hasActiveFilters = !!(search || statusFilter !== "all" || engineFilter !== "all");
  const clearAll = () => {
    onSearch("");
    onStatusFilter("all");
    onEngineFilter("all");
  };

  return (
    <div className="mb-5 rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search by URL, title, or engine..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            />
            {search && (
              <button
                onClick={() => onSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {engines.length > 0 && (
            <div className="relative lg:w-56">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <select
                value={engineFilter}
                onChange={(e) => onEngineFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-9 text-sm font-medium text-gray-700 transition hover:border-gray-300 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="all">All engines</option>
                {engines.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {statuses.map((s) => (
              <button
                key={s.value}
                onClick={() => onStatusFilter(s.value)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === s.value
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
                {s.label}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="ml-1 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>
              Showing <span className="font-semibold text-gray-900">{resultCount.toLocaleString()}</span>
              {resultCount !== totalCount && (
                <span> of <span className="font-semibold text-gray-900">{totalCount.toLocaleString()}</span></span>
              )}
              {" "}record{resultCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DATA TABLE
   ═══════════════════════════════════════════════════════════ */

function DataTable({
  data, sortKey, sortDir, onSort, onRowClick,
}: {
  data: CrawlRecord[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  onRowClick: (r: CrawlRecord) => void;
}) {
  const SortIcon = ({ col }: { col: SortKey }) => {
    const active = sortKey === col;
    return (
      <span className={`ml-1 inline-flex flex-col ${active ? "text-indigo-600" : "text-gray-300"}`}>
        <svg className={`h-2.5 w-2.5 ${active && sortDir === "asc" ? "opacity-100" : "opacity-40"}`} viewBox="0 0 10 6" fill="currentColor">
          <path d="M5 0l5 6H0z" />
        </svg>
        <svg className={`h-2.5 w-2.5 -mt-0.5 ${active && sortDir === "desc" ? "opacity-100" : "opacity-40"}`} viewBox="0 0 10 6" fill="currentColor">
          <path d="M5 6L0 0h10z" />
        </svg>
      </span>
    );
  };

  const headers: { key: SortKey; label: string; className: string }[] = [
    { key: "created_at", label: "Date & Time", className: "w-[160px]" },
    { key: "url", label: "Target", className: "flex-1 min-w-0" },
    { key: "status", label: "Status", className: "w-[120px]" },
    { key: "engine", label: "Engine", className: "w-[130px]" },
    { key: "content_length", label: "Size", className: "w-[110px] text-right" },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gradient-to-b from-gray-50/80 to-gray-50/30">
              {headers.map((h) => (
                <th
                  key={h.key}
                  onClick={() => onSort(h.key)}
                  className={`cursor-pointer select-none px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 transition hover:text-gray-900 ${h.className}`}
                >
                  <span className="inline-flex items-center">
                    {h.label}
                    <SortIcon col={h.key} />
                  </span>
                </th>
              ))}
              <th className="w-[60px] px-6 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((record, idx) => (
              <tr
                key={record.id ?? idx}
                onClick={() => onRowClick(record)}
                className="row-hover cursor-pointer"
              >
                <td className="px-6 py-4 align-top">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400 ring-1 ring-gray-100">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatDate(record.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(record.createdAt)}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 align-top">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 text-xs font-bold text-indigo-600 ring-1 ring-indigo-100">
                      {getFaviconLetter(record.url)}
                    </div>
                    <div className="min-w-0 flex-1">
                      {record.title && (
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {record.title}
                        </p>
                      )}
                      <p className="mt-0.5 truncate text-xs text-gray-500" title={record.url}>
                        {record.url}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 align-top">
                  <StatusBadge status={record.status as Status} />
                </td>

                <td className="px-6 py-4 align-top">
                  <EngineBadge engine={record.engine} />
                </td>

                <td className="px-6 py-4 align-top text-right">
                  <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 font-mono text-xs font-medium text-gray-700 ring-1 ring-gray-200/60">
                    <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" />
                    </svg>
                    {formatBytes(record.contentLength)}
                  </span>
                </td>

                <td className="px-6 py-4 align-top text-right">
                  <button
                    onClick={(e) => { e.stopPropagation(); onRowClick(record); }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                    title="View details"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DETAIL MODAL
   ═══════════════════════════════════════════════════════════ */

function DetailModal({ record, onClose }: { record: CrawlRecord; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "url" | "raw">("overview");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(record.url || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const metaItems = [
    { label: "Record ID", value: record.id?.toString() || "—", icon: "M7 20l4-16m2 16l4-16M6 9h14M4 15h14", mono: true },
    { label: "Status", value: record.status, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", isStatus: true },
    { label: "Engine Used", value: record.engine || "—", icon: "M13 10V3L4 14h7v7l9-11h-7z", isEngine: true },
    { label: "Content Size", value: formatBytes(record.contentLength), icon: "M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z", mono: true },
    { label: "Executed At", value: formatDateTime(record.createdAt), icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { label: "Relative Time", value: formatTimeAgo(record.createdAt), icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "url" as const, label: "URL Details", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" },
    { id: "raw" as const, label: "Raw Data", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-900/40 via-gray-900/30 to-gray-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="slide-up relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-900/5">
        <div className="relative h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-gray-200/80 transition hover:bg-gray-50 hover:text-gray-900"
          aria-label="Close"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="max-h-[85vh] overflow-y-auto scrollbar-thin">
          <div className="border-b border-gray-100 px-8 py-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white shadow-lg shadow-indigo-500/30">
                {getFaviconLetter(record.url)}
              </div>
              <div className="min-w-0 flex-1 pr-8">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={record.status as Status} size="md" />
                  <EngineBadge engine={record.engine} />
                </div>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-gray-900">
                  {record.title || "Untitled Crawl"}
                </h2>
                <div className="mt-1.5 flex items-center gap-2">
                  <p className="truncate text-sm text-gray-500">{record.url}</p>
                  <button
                    onClick={copyUrl}
                    className="flex-shrink-0 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    title="Copy URL"
                  >
                    {copied ? (
                      <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-100 bg-gray-50/50 px-8">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative inline-flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? "text-indigo-600"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                  </svg>
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="px-8 py-6">
            {activeTab === "overview" && (
              <div className="space-y-5">
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Execution Details
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {metaItems.map((item) => (
                      <div
                        key={item.label}
                        className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50/50 p-3.5 transition hover:border-gray-200 hover:shadow-sm"
                      >
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{item.label}</p>
                          {item.isStatus ? (
                            <div className="mt-1"><StatusBadge status={record.status as Status} size="sm" /></div>
                          ) : item.isEngine ? (
                            <div className="mt-1"><EngineBadge engine={record.engine} /></div>
                          ) : (
                            <p className={`mt-0.5 truncate text-sm font-semibold text-gray-900 ${item.mono ? "font-mono" : ""}`}>{item.value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-indigo-50/40 to-violet-50/40 p-4">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">What does this mean?</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-gray-600">
                        This record represents a single crawl execution. The <strong>{record.status}</strong> status indicates the crawl{" "}
                        {record.status === "success" ? "completed successfully and content was retrieved." :
                         record.status === "failed" ? "encountered an error and content could not be retrieved." :
                         record.status === "partial" ? "completed with partial content due to access restrictions." :
                         record.status === "running" ? "is currently in progress." :
                         "is queued and waiting to be processed."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "url" && (
              <div className="space-y-4">
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    URL Breakdown
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                    {getUrlParts(record.url).map((part, i) => (
                      <div key={part.label} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-gray-100" : ""}`}>
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-50 text-[10px] font-bold text-gray-500">
                            {i + 1}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{part.label}</span>
                        </div>
                        <span className="truncate font-mono text-sm text-gray-900">{part.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Full URL</p>
                  <p className="break-all font-mono text-xs text-gray-700">{record.url}</p>
                </div>
              </div>
            )}

            {activeTab === "raw" && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Raw API Response
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(record, null, 2));
                    }}
                    className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </div>
                <pre className="max-h-80 overflow-auto rounded-xl border border-gray-100 bg-gray-900 p-4 font-mono text-xs leading-relaxed text-gray-100 scrollbar-thin">
                  <code>{JSON.stringify(record, null, 2)}</code>
                </pre>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-gray-100 bg-gray-50/50 px-8 py-4">
            <p className="text-xs text-gray-500">
              Press <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-gray-700">Esc</kbd> to close
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={copyUrl}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:shadow-lg hover:shadow-indigo-500/40"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copied ? "Copied!" : "Copy URL"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGINATION
   ═══════════════════════════════════════════════════════════ */

function Pagination({ page, totalPages, onPageChange, total, pageSize }: {
  page: number; totalPages: number; onPageChange: (p: number) => void; total: number; pageSize: number;
}) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pages = useMemo(() => {
    const arr: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) arr.push(i);
    } else {
      arr.push(1);
      if (page > 3) arr.push("ellipsis");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) arr.push(i);
      if (page < totalPages - 2) arr.push("ellipsis");
      arr.push(totalPages);
    }
    return arr;
  }, [page, totalPages]);

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-2xl border border-gray-200/70 bg-white px-6 py-4 shadow-sm sm:flex-row">
      <p className="text-sm text-gray-500">
        Showing <span className="font-semibold text-gray-900">{start}–{end}</span> of{" "}
        <span className="font-semibold text-gray-900">{total.toLocaleString()}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`e${i}`} className="px-1 text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`flex h-9 min-w-[36px] items-center justify-center rounded-lg px-2 text-sm font-semibold transition ${
                page === p
                  ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EMPTY / ERROR / SKELETON
   ═══════════════════════════════════════════════════════════ */

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 ring-1 ring-gray-200/60">
        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">
        {hasFilters ? "No matching records" : "No crawl history yet"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">
        {hasFilters
          ? "Try adjusting your filters or search query to find what you're looking for."
          : "Crawl records will appear here once you start crawling URLs. Each execution is logged automatically."}
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-100 bg-rose-50/50 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/25">
        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">Failed to load history</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-600">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Try again
      </button>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 border-b border-gray-50 px-6 py-4 last:border-b-0">
          <div className="flex items-center gap-2">
            <div className="shimmer h-8 w-8 rounded-lg" />
            <div className="space-y-1.5">
              <div className="shimmer h-3.5 w-20 rounded" />
              <div className="shimmer h-2.5 w-14 rounded" />
            </div>
          </div>
          <div className="flex flex-1 items-center gap-3">
            <div className="shimmer h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="shimmer h-3 w-3/4 rounded" />
              <div className="shimmer h-2.5 w-1/2 rounded" />
            </div>
          </div>
          <div className="shimmer h-6 w-20 rounded-full" />
          <div className="shimmer h-6 w-16 rounded-md" />
          <div className="shimmer h-6 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BADGES
   ═══════════════════════════════════════════════════════════ */

function StatusBadge({ status, size = "md" }: { status: Status; size?: "sm" | "md" | "lg" }) {
  const config: Record<Status, { label: string; dot: string; bg: string; text: string; ring: string }> = {
    success: { label: "Success", dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-600/10" },
    failed:  { label: "Failed",  dot: "bg-rose-500",    bg: "bg-rose-50",    text: "text-rose-700",    ring: "ring-rose-600/10" },
    partial: { label: "Partial", dot: "bg-amber-500",   bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-600/10" },
    running: { label: "Running", dot: "bg-blue-500",    bg: "bg-blue-50",    text: "text-blue-700",    ring: "ring-blue-600/10" },
    pending: { label: "Pending", dot: "bg-gray-500",    bg: "bg-gray-50",    text: "text-gray-700",    ring: "ring-gray-600/10" },
  };
  const c = config[status] || config.pending;
  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1 text-xs",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ${c.bg} ${c.text} ${c.ring} ${sizes[size]}`}>
      <span className="relative flex h-1.5 w-1.5">
        {status === "running" && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${c.dot} opacity-75`} />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${c.dot}`} />
      </span>
      {c.label}
    </span>
  );
}

function EngineBadge({ engine }: { engine?: string | null }) {
  if (!engine) return <span className="text-xs text-gray-400">—</span>;
  const colors: Record<string, string> = {
    default: "from-slate-500 to-slate-600",
    puppeteer: "from-emerald-500 to-teal-600",
    playwright: "from-violet-500 to-purple-600",
    selenium: "from-amber-500 to-orange-600",
    cheerio: "from-blue-500 to-indigo-600",
    axios: "from-rose-500 to-pink-600",
    scrapy: "from-cyan-500 to-sky-600",
    crawl4ai: "from-fuchsia-500 to-pink-600",
  };
  const gradient = colors[engine.toLowerCase()] || colors.default;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md bg-gradient-to-br ${gradient} px-2 py-1 text-[11px] font-semibold text-white shadow-sm`}>
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      {engine}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */

function formatBytes(bytes: number | undefined | null): string {
  if (typeof bytes !== "number" || isNaN(bytes) || bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatTime(d: string | Date): string {
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function formatDateTime(d: string | Date): string {
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}
function formatTimeAgo(d: string | Date): string {
  const then = new Date(d).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function getFaviconLetter(url?: string | null): string {
  if (!url) return "?";
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host.charAt(0).toUpperCase();
  } catch {
    return url.charAt(0).toUpperCase();
  }
}

function getUrlParts(url?: string | null) {
  if (!url) return [{ label: "URL", value: "—" }];
  try {
    const u = new URL(url);
    return [
      { label: "Protocol", value: u.protocol.replace(":", "") },
      { label: "Host", value: u.hostname },
      { label: "Port", value: u.port || "default" },
      { label: "Path", value: u.pathname || "/" },
      { label: "Search", value: u.search || "—" },
      { label: "Hash", value: u.hash || "—" },
    ];
  } catch {
    return [{ label: "URL", value: url }];
  }
}
