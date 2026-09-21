"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Sparkles,
  X,
  Key,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  BookOpen,
  Zap,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  executeAISearch,
  getActiveProvider,
  getStoredApiKey,
  AI_PROVIDERS,
  type AISearchResult,
} from "@/lib/ai-service";
import { MOCK_SUBJECTS } from "@/lib/mock-data";

interface AiSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenKeyModal: () => void;
  initialQuery?: string;
}

const QUICK_EXAM_TOPICS = [
  "Dijkstra vs Bellman-Ford algorithm",
  "AVL Tree rotations with example",
  "Deadlock 4 conditions & Banker's algorithm",
  "TCP 3-way handshake process",
  "B+ Tree vs B-Tree indexing in DBMS",
  "Normalization 1NF to BCNF rules",
];

export function AiSearchModal({
  isOpen,
  onClose,
  onOpenKeyModal,
  initialQuery = "",
}: AiSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [selectedScope, setSelectedScope] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AISearchResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeProvider, setActiveProvider] = useState(getActiveProvider());
  const [hasApiKey, setHasApiKey] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      const provider = getActiveProvider();
      setActiveProvider(provider);
      const key = getStoredApiKey(provider);
      setHasApiKey(Boolean(key));
      if (initialQuery) {
        setQuery(initialQuery);
      }
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, initialQuery]);

  const handleSearch = async (searchQuery?: string) => {
    const q = (searchQuery ?? query).trim();
    if (!q) return;

    setIsLoading(true);
    setResult(null);

    // Find scope title & syllabus context if selected
    let scopeTitle = "All Semester 3 Subjects";
    let syllabusContext = "";

    if (selectedScope !== "all") {
      const subj = MOCK_SUBJECTS.find((s) => s.id === selectedScope);
      if (subj) {
        scopeTitle = `${subj.code}: ${subj.name}`;
        syllabusContext = subj.units
          .map((u) => `Unit ${u.unitNumber}: ${u.title} (${u.topics.join(", ")})`)
          .join("\n");
      }
    }

    try {
      const res = await executeAISearch({
        query: q,
        scopeId: selectedScope,
        scopeTitle,
        syllabusContext,
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenInChat = () => {
    onClose();
    const params = new URLSearchParams();
    if (result?.query) params.set("q", result.query);
    if (selectedScope !== "all") params.set("subject", selectedScope);
    router.push(`/chat?${params.toString()}`);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 sm:pt-16 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-[#0F111E] border border-white/[0.12] shadow-2xl overflow-hidden my-auto sm:my-0 text-[#F1F1F8]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar: Omnibar Input */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-[#141624]">
          <div className="relative flex items-center">
            <div className="absolute left-3.5 p-1 rounded-lg bg-violet-600/20 text-violet-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask an exam doubt, formula derivation, or concept..."
              className="w-full h-12 pl-12 pr-28 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-sm sm:text-base text-white placeholder:text-slate-400 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
            />
            <div className="absolute right-2.5 flex items-center gap-1.5">
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSearch()}
                disabled={isLoading || !query.trim()}
                className="h-8 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-violet-600/30 transition-all disabled:opacity-40"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scope Filters & BYOK Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar">
              <span className="text-[11px] text-slate-400 shrink-0 font-medium">Scope:</span>
              <button
                type="button"
                onClick={() => setSelectedScope("all")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition-colors ${
                  selectedScope === "all"
                    ? "bg-violet-600/30 text-violet-200 border border-violet-500/40"
                    : "bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.05]"
                }`}
              >
                All Subjects
              </button>
              {MOCK_SUBJECTS.slice(0, 4).map((subj) => (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => setSelectedScope(subj.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition-colors ${
                    selectedScope === subj.id
                      ? "bg-violet-600/30 text-violet-200 border border-violet-500/40"
                      : "bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.05]"
                  }`}
                >
                  {subj.code}
                </button>
              ))}
            </div>

            {/* API Key Status / Opener */}
            <button
              type="button"
              onClick={onOpenKeyModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] text-slate-300 transition-colors shrink-0"
            >
              <Key className="w-3 h-3 text-amber-400" />
              <span>
                {hasApiKey ? (
                  <span className="text-emerald-300 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    {AI_PROVIDERS[activeProvider].name.split(" ")[0]}
                  </span>
                ) : (
                  <span className="text-amber-300 font-medium">Connect API Key (Free)</span>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {/* Loading Animation */}
          {isLoading && (
            <div className="py-12 space-y-4 text-center">
              <div className="inline-flex p-3 rounded-2xl bg-violet-600/20 text-violet-400 animate-pulse">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-white">
                  Consulting {AI_PROVIDERS[activeProvider].name}...
                </p>
                <p className="text-xs text-slate-400">
                  Injecting university syllabus curriculum & structuring exam-targeted answer...
                </p>
              </div>
              <div className="w-48 h-1.5 rounded-full bg-slate-800 mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 animate-[pulse_1s_ease-in-out_infinite]" />
              </div>
            </div>
          )}

          {/* Search Result */}
          {!isLoading && result && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Result Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{result.scopeTitle}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-400 font-mono">
                    {result.model}
                  </span>
                  <span className="text-[10px] text-slate-400">{result.latencyMs}ms</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Answer</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenInChat}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 border border-violet-500/30 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open in AI Tutor</span>
                  </button>
                </div>
              </div>

              {/* Demo Mode Notice if no key */}
              {result.isMockDemo && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs text-amber-200">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Demo Mode active. Add your <strong>Google Gemini API key</strong> for live,
                      unlimited answers!
                    </span>
                  </div>
                  <button
                    onClick={onOpenKeyModal}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium underline"
                  >
                    Add Free Key
                  </button>
                </div>
              )}

              {/* Rendered Answer Content */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-sm text-slate-200 leading-relaxed space-y-4 font-sans">
                {result.markdown.split("\n\n").map((block, idx) => {
                  if (block.startsWith("### ")) {
                    const title = block.replace("### ", "");
                    return (
                      <h3
                        key={idx}
                        className="text-base font-bold text-white pt-2 border-b border-white/[0.06] pb-1 flex items-center gap-2"
                      >
                        {title}
                      </h3>
                    );
                  }
                  if (block.startsWith("```")) {
                    const code = block.replace(/```[a-z]*\n?/g, "");
                    return (
                      <pre
                        key={idx}
                        className="p-3 rounded-xl bg-[#090A12] border border-white/[0.08] text-xs font-mono text-cyan-300 overflow-x-auto"
                      >
                        {code}
                      </pre>
                    );
                  }
                  return (
                    <div key={idx} className="text-slate-300 space-y-1">
                      {block.split("\n").map((line, lineIdx) => (
                        <p key={lineIdx} className={line.startsWith("- ") ? "pl-4" : ""}>
                          {line}
                        </p>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Initial State / Suggestions */}
          {!isLoading && !result && (
            <div className="space-y-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Popular Exam Doubts & Topics:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_EXAM_TOPICS.map((topic, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setQuery(topic);
                      handleSearch(topic);
                    }}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-left text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                  >
                    <span className="truncate">{topic}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>

              {/* Promo Card for Free Gemini Key */}
              {!hasApiKey && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-500/20 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-white">Enable Real-Time AI Search</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Connect your Google Gemini API key to unlock unlimited, live questions across
                      your entire engineering curriculum.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenKeyModal}
                    className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shrink-0 shadow-md shadow-violet-600/30 transition-colors"
                  >
                    Enter Key
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 px-5 border-t border-white/[0.06] bg-[#141624] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-[10px] text-slate-300 font-mono">
              Enter
            </kbd>
            <span>to search</span>
            <span className="mx-1">•</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-[10px] text-slate-300 font-mono">
              Esc
            </kbd>
            <span>to close</span>
          </div>

          <button
            onClick={handleOpenInChat}
            className="text-violet-400 hover:text-violet-300 hover:underline flex items-center gap-1"
          >
            <span>Switch to continuous chat</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
