"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Send,
  User,
  Globe,
  Loader2,
  AlertCircle,
  Sparkles,
  Trash2,
  ExternalLink,
} from "lucide-react";

const API = " https://web-scrapper-12.onrender.com";

type Source = {
  url?: string;
  title?: string;
  content?: string;
  text?: string;
  score?: number;
  metadata?: Record<string, unknown>;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  model?: string;
};

const SUGGESTIONS = [
  "Summarize the main findings from my scraped websites",
  "What are the key topics covered in the indexed content?",
  "Compare the information available across my scraped pages",
  "What information is available about the companies I scraped?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [topK, setTopK] = useState(3);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(value = question) {
    const text = value.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setQuestion("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, top_k: topK }),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `Request failed (${response.status})`);
      }

      const data = await response.json();

      if (typeof data.answer !== "string") {
        throw new Error("Unexpected response from the chat API.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          sources: Array.isArray(data.sources) ? data.sources : [],
          model: data.model,
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the chat server."
      );
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([]);
    setError("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <div className="mx-auto flex h-[calc(100vh-2rem)] max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
              <Bot size={25} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                WebIntel AI
              </h1>
              <p className="text-sm text-slate-500">
                Ask questions about your indexed web content
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Sources
              <select
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-2 py-2 outline-none focus:border-indigo-400"
                aria-label="Number of sources"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={8}>8</option>
              </select>
            </label>
            <button
              onClick={clearChat}
              disabled={messages.length === 0 || loading}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={15} />
              Clear
            </button>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-sm font-medium text-slate-600">
              Retrieval-augmented chat
            </span>
            <span className="ml-auto flex items-center gap-1 text-xs text-slate-400">
              <Globe size={13} /> Your indexed content
            </span>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center py-8 text-center"
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
                  <Sparkles size={31} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Chat with your web data
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Ask a question and get an answer from your indexed website
                  content. Answers depend on what your scraper has collected
                  and your backend has indexed.
                </p>

                <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage(suggestion)}
                      disabled={loading}
                      className="rounded-xl border border-slate-200 bg-white p-4 text-left text-sm leading-5 text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50/50 disabled:opacity-50"
                    >
                      <Sparkles
                        size={16}
                        className="mb-2 text-indigo-500"
                      />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.map((message, index) => (
              <motion.div
                key={`${index}-${message.role}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    message.role === "user"
                      ? "bg-slate-900 text-white"
                      : "bg-gradient-to-br from-indigo-600 to-violet-600 text-white"
                  }`}
                >
                  {message.role === "user" ? (
                    <User size={17} />
                  ) : (
                    <Bot size={18} />
                  )}
                </div>

                <div
                  className={`min-w-0 max-w-[85%] ${
                    message.role === "user" ? "text-right" : ""
                  }`}
                >
                  <p className="mb-1 text-xs font-semibold text-slate-500">
                    {message.role === "user" ? "You" : "WebIntel AI"}
                  </p>
                  <div
                    className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-left text-sm leading-7 ${
                      message.role === "user"
                        ? "rounded-tr-sm bg-indigo-600 text-white"
                        : "rounded-tl-sm border border-slate-100 bg-slate-50 text-slate-800"
                    }`}
                  >
                    {message.content}
                  </div>

                  {message.role === "assistant" &&
                    message.sources &&
                    message.sources.length > 0 && (
                      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-left">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Retrieved sources ({message.sources.length})
                        </p>
                        <div className="space-y-2">
                          {message.sources.map((source, sourceIndex) => {
                            const url =
                              source.url ||
                              (typeof source.metadata?.url === "string"
                                ? source.metadata.url
                                : undefined);
                            const title =
                              source.title ||
                              (typeof source.metadata?.title === "string"
                                ? source.metadata.title
                                : undefined) ||
                              url ||
                              `Source ${sourceIndex + 1}`;
                            const excerpt =
                              source.content || source.text || "";

                            return (
                              <div
                                key={`${url || title}-${sourceIndex}`}
                                className="rounded-lg bg-slate-50 p-3"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <p className="break-all text-sm font-medium text-slate-800">
                                    {title}
                                  </p>
                                  {url && (
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="shrink-0 text-indigo-600 hover:text-indigo-800"
                                      aria-label={`Open ${title}`}
                                    >
                                      <ExternalLink size={15} />
                                    </a>
                                  )}
                                </div>
                                {excerpt && (
                                  <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-500">
                                    {excerpt}
                                  </p>
                                )}
                                {typeof source.score === "number" && (
                                  <p className="mt-1 text-xs text-slate-400">
                                    Relevance score: {source.score.toFixed(3)}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {message.model && (
                    <p className="mt-2 text-xs text-slate-400">
                      Model: {message.model}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <Bot size={18} />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 size={16} className="animate-spin text-indigo-600" />
                    Searching indexed content and generating an answer…
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mx-auto flex max-w-2xl items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Could not get an answer</p>
                  <p className="mt-1 break-words">{error}</p>
                  <p className="mt-1 text-xs text-rose-600">
                    Check that the FastAPI backend is running at localhost:8000
                    and that the chat endpoint is available.
                  </p>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage();
            }}
            className="border-t border-slate-100 bg-white p-4 sm:p-5"
          >
            <div className="mx-auto flex max-w-4xl items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Ask anything about your scraped websites…"
                rows={1}
                className="max-h-32 min-h-11 flex-1 resize-y bg-transparent px-3 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!question.trim() || loading}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-slate-400">
              Answers are generated from retrieved indexed content. Verify
              important information against the original sources.
            </p>
          </form>
        </main>
      </div>
    </div>
  );
}
