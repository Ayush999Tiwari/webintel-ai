"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  BarChart3,
  BookOpen,
  MessageSquare,
  KeyRound,
  Settings,
  LogOut,
  Globe,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "History", href: "/dashboard/history", icon: History },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Knowledge Base", href: "/dashboard/knowledge-base", icon: BookOpen },
  { label: "AI Chat", href: "/dashboard/chat", icon: MessageSquare },
  { label: "API Keys", href: "/dashboard/api-keys", icon: KeyRound },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function SidebarContent() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    window.localStorage.removeItem("access_token");
    router.push("/login");
  }

  return (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-2 px-6 py-6 group">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
          <Globe className="h-6 w-6 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-gray-900">WebIntel AI</span>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-600 to-indigo-600"
                />
              )}
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut className="h-4.5 w-4.5" />
          Logout
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-gray-100 bg-white/90 backdrop-blur-lg md:flex lg:w-72">
        <SidebarContent />
      </aside>

      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm md:hidden"
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/30 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl md:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
              >
                <X className="h-4 w-4 text-gray-700" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
