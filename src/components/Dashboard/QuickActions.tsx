"use client";

import { PlusCircle, Upload, Download, BookOpen } from "lucide-react";

const ACTIONS = [
  { label: "Import URLs", icon: Upload, primary: false },
  { label: "Export History", icon: Download, primary: false },
  { label: "Open Docs", icon: BookOpen, primary: false },
];

export function QuickActions() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">Quick Actions</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACTIONS.map(({ label, icon: Icon, primary }) => (
          <button
            key={label}
            className={`flex flex-col items-center gap-2 rounded-xl border py-4 text-xs font-semibold transition-all ${
              primary
                ? "border-transparent bg-gray-900 text-white hover:bg-blue-600"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
