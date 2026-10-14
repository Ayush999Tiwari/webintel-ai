
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Check,
  ChevronRight,
  Code2,
  Database,
  FileSearch,
  Globe,
  Layers3,
  Menu,
  MessageSquareText,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  Zap,
} from "lucide-react";

// -----------------------------------------------------------------------------
// Shared types and motion
// -----------------------------------------------------------------------------

type IconComponent = LucideIcon;

type Feature = {
  icon: IconComponent;
  title: string;
  description: string;
  tag: string;
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Navigation
// -----------------------------------------------------------------------------

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Architecture", href: "#architecture" },
  { label: "Use cases", href: "#use-cases" },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <nav
        className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label="WebIntel AI home"
          onClick={() => setIsOpen(false)}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-900/10 transition-transform group-hover:scale-105">
            <Globe size={21} strokeWidth={1.8} />
          </span>

          <span className="text-lg font-bold tracking-tight text-slate-950">
            WebIntel<span className="text-indigo-600"> AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-5 md:flex">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 transition-colors hover:text-indigo-600"
          >
            Log in
          </Link>

          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-600"
          >
            Get started
            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 md:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white px-5 py-5 shadow-xl md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
              >
                {item.label}
              </a>
            ))}

            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-800"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="rounded-xl bg-slate-950 py-3 text-center text-sm font-semibold text-white"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// -----------------------------------------------------------------------------
// Reusable UI
// -----------------------------------------------------------------------------

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={`max-w-3xl ${
        align === "center" ? "mx-auto text-center" : "text-left"
      }`}
    >
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
        {eyebrow}
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
        {title}
      </h2>

      <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
        {description}
      </p>
    </div>
  );
}

function IconBox({
  icon: Icon,
  dark = false,
}: {
  icon: IconComponent;
  dark?: boolean;
}) {
  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
        dark
          ? "bg-white/10 text-indigo-200 ring-1 ring-white/10"
          : "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100/80"
      }`}
    >
      <Icon size={22} strokeWidth={1.8} />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Hero
// -----------------------------------------------------------------------------

function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-white pb-20 pt-32 sm:pb-28 sm:pt-40 lg:pt-44">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-indigo-200/35 blur-[110px]" />
        <div className="absolute -right-32 top-24 h-96 w-96 rounded-full bg-sky-200/35 blur-[110px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm sm:text-sm"
          >
            <Sparkles size={15} className="text-indigo-600" />
            <span>Web intelligence infrastructure for AI applications</span>
            <ChevronRight size={14} className="text-slate-400" />
          </motion.div>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06 }}
            className="text-4xl font-bold leading-[1.1] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-[76px]"
          >
            The web is full of data.
            <span className="mt-2 block bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 bg-clip-text text-transparent">
              Make it AI-ready.
            </span>
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8"
          >
            Crawl websites, extract structured content, index knowledge, and
            ask natural-language questions over your collected data — through
            one developer-friendly workflow.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.23 }}
            className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/signup"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/25"
            >
              Start building
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <a
              href="#architecture"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              <Code2 size={17} />
              Explore the architecture
            </a>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500 sm:text-sm"
          >
            <span className="inline-flex items-center gap-1.5">
              <Check size={15} className="text-emerald-600" />
              Structured extraction
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
            <span className="inline-flex items-center gap-1.5">
              <Check size={15} className="text-emerald-600" />
              Semantic retrieval
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
            <span className="inline-flex items-center gap-1.5">
              <Check size={15} className="text-emerald-600" />
              Grounded AI chat
            </span>
          </motion.div>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Product preview — explicitly illustrative, not live production metrics
// -----------------------------------------------------------------------------

function DashboardPreview() {
  const bars = [34, 52, 43, 68, 47, 78, 60, 86, 55, 72, 48, 91];

  return (
    <Reveal className="relative mx-auto mt-16 max-w-6xl sm:mt-20">
      <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-r from-indigo-300/30 via-violet-300/20 to-sky-300/30 blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 sm:rounded-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/90 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>

            <div className="hidden h-6 items-center rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-500 sm:flex">
              app.webintel.ai/dashboard
            </div>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-800 sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Illustrative preview
          </span>
        </div>

        <div className="grid min-h-[400px] grid-cols-1 md:grid-cols-[190px_1fr]">
          <aside className="hidden border-r border-slate-200 bg-slate-50/70 p-4 md:block">
            <div className="mb-7 flex items-center gap-2 px-2">
              <Globe size={19} className="text-indigo-600" />
              <span className="text-sm font-bold text-slate-900">
                WebIntel AI
              </span>
            </div>

            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Workspace
            </p>

            {[
              { icon: Layers3, label: "Overview", active: true },
              { icon: Globe, label: "Crawl jobs", active: false },
              { icon: Database, label: "Knowledge base", active: false },
              { icon: MessageSquareText, label: "AI chat", active: false },
              { icon: Activity, label: "Analytics", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium ${
                  item.active
                    ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
                    : "text-slate-500"
                }`}
              >
                <item.icon size={15} />
                {item.label}
              </div>
            ))}

            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <ShieldCheck size={15} className="text-emerald-600" />
                Data pipeline
              </div>
              <p className="mt-2 text-[11px] leading-5 text-slate-500">
                Crawl, store, index, retrieve.
              </p>
            </div>
          </aside>

          <div className="min-w-0 p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Workspace / Overview
                </p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                  Knowledge workspace
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  An example of the product experience.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
                <Activity size={14} className="text-indigo-600" />
                Pipeline overview
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Globe,
                  label: "Crawl jobs",
                  value: "Job history",
                  description: "Track submitted URLs",
                  color: "text-indigo-600",
                  bg: "bg-indigo-50",
                },
                {
                  icon: Database,
                  label: "Stored content",
                  value: "Structured data",
                  description: "Review extracted results",
                  color: "text-sky-600",
                  bg: "bg-sky-50",
                },
                {
                  icon: MessageSquareText,
                  label: "Knowledge retrieval",
                  value: "Context search",
                  description: "Ask questions over data",
                  color: "text-violet-600",
                  bg: "bg-violet-50",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-200"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.bg} ${card.color}`}
                    >
                      <card.icon size={18} />
                    </span>
                    <ArrowUpRight size={15} className="text-slate-300" />
                  </div>

                  <p className="mt-4 text-xs font-medium text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Processing pipeline
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">
                      From web page to searchable knowledge
                    </p>
                  </div>
                  <Workflow size={18} className="text-indigo-600" />
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    { icon: Globe, title: "Web crawling", detail: "Collect page content" },
                    { icon: FileSearch, title: "Content extraction", detail: "Normalize useful information" },
                    { icon: Database, title: "Indexing & storage", detail: "Prepare context for retrieval" },
                    { icon: Bot, title: "AI question answering", detail: "Retrieve context for responses" },
                  ].map((step, index) => (
                    <div
                      key={step.title}
                      className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-indigo-600">
                        <step.icon size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800">
                          {step.title}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {step.detail}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">
                        0{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Example activity
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">
                      Illustrative UI, not live events
                    </p>
                  </div>
                  <Activity size={18} className="text-indigo-600" />
                </div>

                <div className="mt-5 flex h-24 items-end gap-1.5">
                  {bars.map((height, index) => (
                    <div
                      key={index}
                      className="flex flex-1 items-end"
                      style={{ height: "100%" }}
                    >
                      <div
                        className="w-full rounded-t-sm bg-gradient-to-t from-indigo-600 to-violet-400 opacity-80"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                  <span>Sample interval</span>
                  <span>Sample interval</span>
                </div>

                <div className="mt-5 rounded-xl bg-slate-950 p-4 text-white">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Sparkles size={15} className="text-indigo-300" />
                    Ask your knowledge base
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-300">
                    &ldquo;Summarize the main points from the indexed pages.&rdquo;
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
                    <Search size={13} />
                    Retrieve relevant context before answering
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        Product concept preview · Values and activity are illustrative, not
        production telemetry.
      </p>
    </Reveal>
  );
}

// -----------------------------------------------------------------------------
// Technology strip
// -----------------------------------------------------------------------------

function TechStackSection() {
  const technologies = [
    "Next.js",
    "TypeScript",
    "FastAPI",
    "PostgreSQL",
    "ChromaDB",
    "Sentence Transformers",
    "Groq",
  ];

  return (
    <section className="border-y border-slate-200 bg-slate-50/70 py-9">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 sm:text-xs">
          Built with a modern web and AI stack
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 sm:gap-x-8 lg:gap-x-12">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm sm:text-sm"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Features
// -----------------------------------------------------------------------------

const features: Feature[] = [
  {
    icon: Globe,
    title: "Web crawling",
    tag: "Data collection",
    description:
      "Collect website pages with supported crawling engines and retain crawl results for inspection.",
  },
  {
    icon: FileSearch,
    title: "Structured extraction",
    tag: "Content processing",
    description:
      "Turn page responses into organized content, metadata, and links that are easier to work with.",
  },
  {
    icon: Search,
    title: "Semantic retrieval",
    tag: "Vector search",
    description:
      "Represent indexed content as embeddings and retrieve relevant context for natural-language queries.",
  },
  {
    icon: MessageSquareText,
    title: "Chat with scraped data",
    tag: "RAG workflow",
    description:
      "Ask questions about indexed website content and use retrieved sources to ground the answer.",
  },
  {
    icon: Database,
    title: "Persistent storage",
    tag: "Data management",
    description:
      "Keep crawl-job records and extracted results in a database, with a separate vector index for retrieval.",
  },
  {
    icon: Activity,
    title: "Operational visibility",
    tag: "Observability",
    description:
      "Inspect crawl history, job status, and available analytics to understand what the pipeline has processed.",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-24 bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Core capabilities"
          title="A practical foundation for web intelligence"
          description="Bring collection, extraction, indexing, and retrieval into one workflow. Each layer has a clear responsibility, making the system easier to understand and extend."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.article
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-900/[0.04] sm:p-7"
            >
              <div className="flex items-start justify-between gap-3">
                <IconBox icon={feature.icon} />
                <span className="rounded-md bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200/80">
                  {feature.tag}
                </span>
              </div>

              <h3 className="mt-6 text-lg font-bold tracking-tight text-slate-950">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                {feature.description}
              </p>

              <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100">
                Built for extensibility
                <ArrowRight size={13} />
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Workflow
// -----------------------------------------------------------------------------

const workflowSteps = [
  {
    number: "01",
    icon: Globe,
    title: "Submit a website",
    description:
      "Provide a URL and initiate a crawl using an available crawling engine.",
    output: "Input · URL",
  },
  {
    number: "02",
    icon: FileSearch,
    title: "Extract useful content",
    description:
      "Process the crawl result into page content, metadata, and structured records.",
    output: "Output · Content",
  },
  {
    number: "03",
    icon: Database,
    title: "Index the knowledge",
    description:
      "Create searchable representations of the collected content and persist the index.",
    output: "Output · Search index",
  },
  {
    number: "04",
    icon: MessageSquareText,
    title: "Retrieve and ask",
    description:
      "Retrieve relevant context and pass it to the language model to generate a response.",
    output: "Output · Answer + sources",
  },
];

function WorkflowSection() {
  return (
    <section
      id="workflow"
      className="scroll-mt-24 border-y border-slate-200 bg-slate-50/70 py-24 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="From raw URLs to useful answers"
          description="A clear, inspectable sequence of steps. Separate ingestion from retrieval so each part can be tested, debugged, and evolved independently."
        />

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {workflowSteps.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.07}>
              <article className="relative h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-[0.16em] text-indigo-600">
                    STEP {step.number}
                  </span>
                  <IconBox icon={step.icon} />
                </div>

                <h3 className="mt-7 text-lg font-bold text-slate-950">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {step.description}
                </p>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {step.output}
                  </span>
                </div>

                {index < workflowSteps.length - 1 && (
                  <div className="absolute -bottom-4 left-1/2 z-10 hidden -translate-x-1/2 rounded-full border border-slate-200 bg-white p-1.5 text-slate-400 lg:flex">
                    <ArrowRight size={13} />
                  </div>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Architecture
// -----------------------------------------------------------------------------

const architectureLayers = [
  {
    icon: Globe,
    name: "Ingestion layer",
    technologies: "Playwright · Crawl4AI",
    description: "Fetch and collect website content.",
    color: "border-sky-200 bg-sky-50 text-sky-700",
  },
  {
    icon: Code2,
    name: "API and application layer",
    technologies: "Next.js · FastAPI",
    description: "Handle the interface, API requests, and application logic.",
    color: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  {
    icon: Database,
    name: "Persistence layer",
    technologies: "PostgreSQL · ChromaDB",
    description: "Store crawl records and vector-indexed content separately.",
    color: "border-violet-200 bg-violet-50 text-violet-700",
  },
  {
    icon: Network,
    name: "Retrieval and generation",
    technologies: "Embeddings · Groq",
    description: "Retrieve relevant context and generate context-aware answers.",
    color: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
];

function ArchitectureSection() {
  return (
    <section id="architecture" className="scroll-mt-24 bg-white py-24 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-start gap-14 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <Reveal>
          <SectionHeading
            eyebrow="System design"
            align="left"
            title="Designed in layers. Built to evolve."
            description="A full-stack AI application involves more than a model call. Separate APIs, persistent records, vector retrieval, and generation to make the system easier to maintain and debug."
          />

          <div className="mt-8 space-y-4">
            {[
              "Clear boundaries between frontend and backend",
              "Persistent crawl history and inspectable results",
              "Dedicated semantic retrieval workflow",
              "A modular foundation for future improvements",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <Check size={12} strokeWidth={2.5} />
                </span>
                <p className="text-sm leading-6 text-slate-600">{item}</p>
              </div>
            ))}
          </div>

          <a
            href="#workflow"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Explore the workflow
            <ArrowRight size={16} />
          </a>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/[0.04] sm:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Reference architecture
                </p>
                <h3 className="mt-1.5 text-lg font-bold text-slate-950">
                  WebIntel AI stack
                </h3>
              </div>

              <span className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600">
                <Layers3 size={19} />
              </span>
            </div>

            <div className="space-y-0 pt-5">
              {architectureLayers.map((layer, index) => (
                <React.Fragment key={layer.name}>
                  <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-200 hover:bg-slate-50/50">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${layer.color}`}
                    >
                      <layer.icon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900">
                        {layer.name}
                      </h4>
                      <p className="mt-1 break-words font-mono text-[11px] font-medium text-indigo-600">
                        {layer.technologies}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {layer.description}
                      </p>
                    </div>
                  </div>

                  {index < architectureLayers.length - 1 && (
                    <div className="flex h-7 items-center pl-9">
                      <div className="h-full border-l border-dashed border-slate-300" />
                      <ArrowDown size={13} className="-ml-[7px] text-slate-400" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="mt-5 rounded-xl bg-slate-950 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Zap size={15} className="text-amber-300" />
                Core design principle
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Keep ingestion, storage, retrieval, and generation independently
                understandable and testable.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Use cases
// -----------------------------------------------------------------------------

const useCases = [
  {
    icon: Bot,
    title: "RAG applications",
    description:
      "Build a searchable knowledge layer from website content for question answering and contextual AI assistants.",
    tags: ["Retrieval", "Context", "LLMs"],
  },
  {
    icon: Search,
    title: "Research and discovery",
    description:
      "Collect relevant web content, inspect extracted information, and search across the material you have indexed.",
    tags: ["Research", "Search", "Extraction"],
  },
  {
    icon: Activity,
    title: "Data intelligence tools",
    description:
      "Use structured web data as an input for internal tools, reporting workflows, and downstream analysis.",
    tags: ["Structured data", "APIs", "Analytics"],
  },
];

function UseCasesSection() {
  return (
    <section
      id="use-cases"
      className="scroll-mt-24 border-y border-slate-200 bg-slate-50/70 py-24 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Use cases"
          title="A data layer for your next AI product"
          description="Use collected website content as a starting point for applications that need structured information and contextual retrieval."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {useCases.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.08}>
              <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-7 transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-900/[0.04]">
                <IconBox icon={item.icon} />

                <h3 className="mt-6 text-xl font-bold tracking-tight text-slate-950">
                  {item.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
                  {item.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Final CTA
// -----------------------------------------------------------------------------

function CTASection() {
  return (
    <section className="bg-white px-5 py-24 sm:px-8 sm:py-28">
      <Reveal className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-indigo-600/30 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-28 -right-16 h-72 w-72 rounded-full bg-violet-600/25 blur-[90px]" />

          <div className="relative">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-indigo-200 ring-1 ring-white/15">
              <Sparkles size={23} />
            </div>

            <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Give your AI the context it needs.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
              Start with a website. Build a searchable knowledge base. Create
              more useful AI-powered experiences on top of your data.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition-all hover:bg-indigo-50"
              >
                Get started
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <a
                href="#architecture"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                View architecture
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Footer
// -----------------------------------------------------------------------------

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-start">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Globe size={19} />
              </span>
              <span className="font-bold tracking-tight text-slate-950">
                WebIntel<span className="text-indigo-600"> AI</span>
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
              Turning collected web content into structured, searchable
              knowledge for AI applications.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-medium text-slate-600">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="transition-colors hover:text-indigo-600"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/login"
              className="transition-colors hover:text-indigo-600"
            >
              Log in
            </Link>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-3 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} WebIntel AI. All rights reserved.
          </p>
          <p>Built for developers building with web data and AI.</p>
        </div>
      </div>
    </footer>
  );
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-clip bg-white text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-950">
      <Navbar />
      <HeroSection />
      <TechStackSection />
      <FeaturesSection />
      <WorkflowSection />
      <ArchitectureSection />
      <UseCasesSection />
      <CTASection />
      <Footer />
    </main>
  );
}
