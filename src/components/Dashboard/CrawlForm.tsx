"use client";
import { useState, type FormEvent } from "react";
import { Loader2, Globe2 } from "lucide-react";
import { useScrape } from "@/hooks/useScrape";
function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
export function CrawlForm() {
  const [url, setUrl] = useState("");
  const [touched, setTouched] = useState(false);
  const { mutate, isPending } = useScrape();
  const valid = isValidUrl(url);
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    mutate({ url }, { onSuccess: () => setUrl("") });
  }
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">Start a new crawl</h3>
      <p className="text-sm text-gray-500">Point WebIntel AI at any public URL to extract structured content</p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Globe2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="https://openai.com"
            aria-label="Website URL"
            aria-invalid={touched && !valid}
            disabled={isPending}
            className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-500 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-44"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Crawling...
            </>
          ) : (
            "Start Crawl"
          )}
        </button>
      </form>
      {touched && !valid && url.length > 0 && (
        <p className="mt-2 text-xs text-red-600">Enter a valid URL, including https://</p>
      )}
    </div>
  );
}
