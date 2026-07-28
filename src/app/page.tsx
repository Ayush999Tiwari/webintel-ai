"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  Search, 
  MessageSquare, 
  Activity, 
  Database, 
  Cpu, 
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';

// --- Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-lg border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Globe className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">WebIntel AI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8">
            {['Features', 'Architecture', 'Pricing', 'Docs'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">
                {item}
              </a>
            ))}
          </div>

          {/* Desktop CTA - GitHub Removed */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/login" className="text-gray-900 font-semibold text-sm hover:text-blue-600 transition-colors">
              Login
            </Link>
            <Link href="/signup" className="text-gray-900 font-semibold text-sm hover:text-blue-600 transition-colors">
              Signup
            </Link>

            <Link 
              href="/signup" 
              className="bg-gray-900 hover:bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg hover:shadow-blue-500/25"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
        >
          <div className="px-4 py-6 space-y-4">
            {['Features', 'Architecture', 'Pricing', 'Docs'].map((item) => (
              <a key={item} href="#" className="block text-lg font-medium text-gray-900">{item}</a>
            ))}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
              <Link href="/login" className="w-full py-3 text-center text-gray-600 font-semibold">Login</Link>
              <Link href="/signup" className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-center">Get Started</Link>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Gradient Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl mix-blend-multiply animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-semibold text-gray-700 mb-8 hover:border-blue-300 transition-colors cursor-default"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          v2.0 is now live
        </motion.div>

        {/* Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 text-balance"
        >
          Turn Any Website Into <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            An AI Knowledge Base
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed"
        >
          Crawl websites at scale, extract structured knowledge, search semantically, and chat with your data using enterprise-grade AI.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
        >
          <Link href="/signup" className="px-8 py-4 bg-gray-900 hover:bg-blue-600 text-white rounded-full font-semibold text-lg transition-all shadow-xl hover:shadow-blue-500/25 flex items-center justify-center gap-2 group">
            Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-full font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-sm">
            View Documentation
          </button>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-5xl mx-auto perspective-1000"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20"></div>
          <div className="relative bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-800 ring-1 ring-white/10">
            {/* Browser Header */}
            <div className="h-12 bg-gray-800/50 border-b border-gray-700 flex items-center px-4 gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="flex-1 bg-gray-900/50 rounded-md h-8 flex items-center px-3 text-xs text-gray-500 font-mono">
                app.webintel.ai/dashboard
              </div>
            </div>
            
            {/* Dashboard Content */}
            <div className="p-8 grid grid-cols-12 gap-8 min-h-[400px] bg-gray-900">
              {/* Sidebar */}
              <div className="col-span-3 hidden md:flex flex-col gap-6">
                <div className="space-y-1">
                  <div className="h-10 bg-blue-600/10 border border-blue-500/20 rounded-lg flex items-center px-4 text-blue-400 text-sm font-medium">Dashboard</div>
                  <div className="h-10 hover:bg-gray-800 rounded-lg flex items-center px-4 text-gray-400 text-sm transition-colors">Crawlers</div>
                  <div className="h-10 hover:bg-gray-800 rounded-lg flex items-center px-4 text-gray-400 text-sm transition-colors">Knowledge Base</div>
                </div>
              </div>
              
              {/* Main Stats */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Pages Crawled", val: "1.2M", color: "text-blue-400" },
                    { label: "Active Bots", val: "42", color: "text-green-400" },
                    { label: "Tokens Used", val: "850K", color: "text-purple-400" }
                  ].map((stat, i) => (
                    <div key={i} className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
                      <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{stat.label}</div>
                      <div className={`text-2xl font-bold ${stat.color}`}>{stat.val}</div>
                    </div>
                  ))}
                </div>
                
                {/* Chart Placeholder */}
                <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-6 h-64 flex items-end justify-between gap-2">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 80].map((h, i) => (
                    <div key={i} className="w-full bg-gradient-to-t from-blue-600/20 to-blue-500 rounded-t-sm hover:from-blue-500 hover:to-indigo-500 transition-all duration-300" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const TechStack = () => {
  const techs = ["Next.js", "FastAPI", "Playwright", "PostgreSQL", "Redis", "pgvector", "Docker", "OpenAI"];
  
  return (
    <section className="py-12 border-y border-gray-100 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">Powered By Industry Standards</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          {techs.map((tech) => (
            <span key={tech} className="text-lg font-bold text-gray-600 hover:text-blue-600 cursor-default transition-colors">{tech}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -8 }}
    className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 group"
  >
    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
      <Icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

const FeaturesSection = () => {
  const features = [
    { icon: Globe, title: "Distributed Crawling", description: "Crawl thousands of pages using parallel workers with automatic retries and fault tolerance." },
    { icon: Cpu, title: "AI Content Extraction", description: "Extract clean content, metadata, summaries, entities, and topics from any website." },
    { icon: Search, title: "Semantic Search", description: "Search across all scraped knowledge using vector embeddings and similarity search." },
    { icon: MessageSquare, title: "Chat with Websites", description: "Ask natural language questions and receive answers grounded in your scraped data." },
    { icon: Activity, title: "Website Monitoring", description: "Track website changes and receive alerts whenever content changes." },
    { icon: Database, title: "Analytics Dashboard", description: "Monitor crawl health, performance metrics, and extraction statistics." },
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
          <p className="text-lg text-gray-600">Transform unstructured web data into actionable AI-ready knowledge.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="text-blue-500 w-6 h-6" />
            <span className="font-bold text-xl text-white">WebIntel AI</span>
          </div>
          <p className="max-w-xs text-gray-400 leading-relaxed">
            The enterprise platform for turning the open web into structured, searchable AI knowledge.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-white mb-6">Product</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Integrations</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-6">Company</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="#" className="hover:text-blue-400 transition-colors">About</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
        © 2024 WebIntel AI. All rights reserved.
      </div>
    </footer>
  );
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <HeroSection />
      <TechStack />
      <FeaturesSection />
      <Footer />
    </main>
  );
}