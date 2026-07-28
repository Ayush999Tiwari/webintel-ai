"use client";

import { Sidebar } from "@/components/Dashboard/Sidebar";
import { Navbar } from "@/components/Dashboard/Navbar";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { checked } = useAuthGuard();

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <div className="md:pl-64 lg:pl-72">
        <Navbar />
        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
