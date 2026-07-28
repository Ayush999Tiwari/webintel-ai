"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { triggerScrape } from "@/lib/api";
import { HISTORY_QUERY_KEY } from "@/hooks/useHistory";
import type { ScrapeRequestPayload } from "@/types";

export function useScrape() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ScrapeRequestPayload) => triggerScrape(payload),
    onSuccess: (data) => {
      toast.success(`Crawl started for ${data.website}`, {
        description: "We'll update the history as soon as it completes.",
      });
      queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error("Couldn't start the crawl", { description: error.message });
    },
  });
}
