"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const COLOR_MAP = {
  blue: { bg: "bg-blue-50", text: "text-blue-600" },
  purple: { bg: "bg-purple-50", text: "text-purple-600" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600" },
  emerald: { bg: "bg-green-50", text: "text-green-600" },
} as const;

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: keyof typeof COLOR_MAP;
  trend?: number;
  formatValue?: (value: number) => string;
  index?: number;
}

function useAnimatedNumber(target: number, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

export function StatsCard({ label, value, icon: Icon, color, trend, formatValue, index = 0 }: StatsCardProps) {
  const animated = useAnimatedNumber(value);
  const palette = COLOR_MAP[color];
  const isPositive = (trend ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl"
    >
      <div className="flex items-start justify-between">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", palette.bg)}>
          <Icon className={cn("h-5 w-5", palette.text)} />
        </div>
        {typeof trend === "number" && (
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
              isPositive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            )}
          >
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      <p className="mt-4 text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
        {formatValue ? formatValue(animated) : animated.toLocaleString()}
      </p>
    </motion.div>
  );
}
