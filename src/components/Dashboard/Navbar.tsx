"use client";

import { Search, Bell, Moon, Home } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-gray-100 bg-white/80 px-4 backdrop-blur-lg md:px-8">
      <div className="ml-12 flex-1 md:ml-0 md:max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search crawls, domains, reports..."
            aria-label="Search"
            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* 👇 Home Button Added Here 👇 */}
        <Link
          href="/"
          title="Back to Home"
          aria-label="Back to Home"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-all hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
        >
          <Home className="h-4.5 w-4.5" />
        </Link>

        <span className="hidden items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 sm:inline-flex">
          Pro Plan
        </span>

        <button
          disabled
          title="Dark mode coming soon"
          aria-label="Toggle theme (coming soon)"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 opacity-60"
        >
          <Moon className="h-4.5 w-4.5" />
        </button>

        <button
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600" />
        </button>

        <div className="flex items-center gap-2.5 border-l border-gray-100 pl-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-semibold text-white">
            AT
          </div>
          <span className="hidden text-sm font-semibold text-gray-900 sm:inline">Ayush</span>
        </div>
      </div>
    </header>
  );
}