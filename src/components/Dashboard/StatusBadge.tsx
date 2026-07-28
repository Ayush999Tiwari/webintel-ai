import { CheckCircle2, Loader2, XCircle, Clock , AlertCircle} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CrawlStatus } from "@/types";

const STATUS_MAP: Record<
  CrawlStatus,
  { label: string; classes: string; icon: React.ElementType }
> = {
  success: { label: "Success", classes: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  running: { label: "Running", classes: "bg-blue-50 text-blue-700 border-blue-200", icon: Loader2 },
  failed: { label: "Failed", classes: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  pending: { label: "Pending", classes: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  partial: { label: "Partial", classes: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: AlertCircle },

};

export function StatusBadge({ status }: { status: CrawlStatus }) {
  const { label, classes, icon: Icon } = STATUS_MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        classes
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", status === "running" && "animate-spin")} />
      {label}
    </span>
  );
}
