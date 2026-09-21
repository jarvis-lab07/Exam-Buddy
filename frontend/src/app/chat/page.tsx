"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bot,
  Sparkles,
  Send,
  User,
  Key,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Zap,
  BookOpen,
  ArrowDownCircle,
} from "lucide-react";
import {
  executeAISearch,
  getActiveProvider,
  getStoredApiKey,
  AI_PROVIDERS,
  type AIProvider,
} from "@/lib/ai-service";
import { MOCK_SUBJECTS } from "@/lib/mock-data";
import { ApiKeyModal } from "@/components/ai/ApiKeyModal";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  latencyMs?: number;
  isMockDemo?: boolean;
  timestamp: string;
}

const INITIAL_SUGGESTIONS = [
  "Dijkstra vs Bellman-Ford algorithm with time complexity",
  "Explain 4 Coffman conditions for Deadlock",
  "How do AVL tree rotations restore balance?",
  "Explain TCP 3-way handshake with sequence diagram",
];

function ChatContent() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get("subject");
  const queryParam = searchParams.get("q");

  const [selectedSubject, setSelectedSubject] = useState<string>(subjectParam || "all");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello Durgesh! I am your **Exam-Buddy AI Tutor**. I analyze your university syllabus modules to give you direct, exam-targeted solutions, formulas, and PYQ tips. What concept can I clarify for you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<AIProvider>("gemini");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const refreshKeyStatus = () => {
    const prov = getActiveProvider();
    setActiveProvider(prov);
    const key = getStoredApiKey(prov);
    setHasApiKey(Boolean(key));
  };

  useEffect(() => {
    refreshKeyStatus();
  }, []);

  // If queryParam exists, auto-submit or prefill
  useEffect(() => {
    if (queryParam) {
      handleSendMessage(queryParam);
    }
  }, [queryParam]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Resolve context
    let scopeTitle = "All Semester 3 Engineering Subjects";
    let syllabusContext = "";
    if (selectedSubject !== "all") {
      const subj = MOCK_SUBJECTS.find((s) => s.id === selectedSubject);
      if (subj) {
        scopeTitle = `${subj.code}: ${subj.name}`;
        syllabusContext = subj.units
          .map((u) => `Unit ${u.unitNumber}: ${u.title} (${u.topics.join(", ")})`)
          .join("\n");
      }
    }

    try {
      const result = await executeAISearch({
        query: text,
        scopeId: selectedSubject,
        scopeTitle,
        syllabusContext,
      });

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: result.markdown,
        model: result.model,
        latencyMs: result.latencyMs,
        isMockDemo: result.isMockDemo,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: `assistant-err-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error while consulting the AI model. Please verify your API key or network connection.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Top Bar */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              AI Tutor & Syllabus Search
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25">
                Semester 3
              </span>
            </h1>
            <p className="text-xs text-[#9B99B5]">
              Curriculum-aligned answers with exam definitions, formulas, and PYQ hints.
            </p>
          </div>
        </div>

        {/* Scope Selector & BYOK Button */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="h-8 px-2.5 rounded-xl bg-[#141624] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-violet-500/40"
          >
            <option value="all">All Subjects (Universal)</option>
            {MOCK_SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}: {s.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsKeyModalOpen(true)}
            className="h-8 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {hasApiKey ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  {AI_PROVIDERS[activeProvider].name.split(" ")[0]}
                </span>
              ) : (
                <span className="text-amber-300 font-medium">Add API Key</span>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 glass-card p-4 sm:p-6 rounded-3xl border border-white/[0.08] overflow-y-auto space-y-5">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-semibold text-xs"
                    : "bg-violet-600/20 text-violet-400 border border-violet-500/30"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed space-y-3 ${
                  isUser
                    ? "bg-violet-600/20 border border-violet-500/30 text-white"
                    : "bg-white/[0.03] border border-white/[0.06] text-slate-200"
                }`}
              >
                {/* Meta info for Assistant */}
                {!isUser && (
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.05] text-[11px] text-slate-400">
                    <span className="font-medium text-violet-300">Exam-Buddy AI</span>
                    <div className="flex items-center gap-2">
                      {m.model && <span className="font-mono text-[10px]">{m.model}</span>}
                      {m.latencyMs && <span>{m.latencyMs}ms</span>}
                      <button
                        type="button"
                        onClick={() => copyMessage(m.id, m.content)}
                        className="hover:text-white transition-colors"
                        title="Copy message"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Body Content */}
                <div className="space-y-2">
                  {m.content.split("\n\n").map((block, i) => {
                    if (block.startsWith("### ")) {
                      return (
                        <h4
                          key={i}
                          className="font-bold text-white pt-2 border-b border-white/[0.05] pb-0.5 text-sm"
                        >
                          {block.replace("### ", "")}
                        </h4>
                      );
                    }
                    if (block.startsWith("```")) {
                      const code = block.replace(/```[a-z]*\n?/g, "");
                      return (
                        <pre
                          key={i}
                          className="p-3 rounded-xl bg-[#090A12] border border-white/[0.08] text-xs font-mono text-cyan-300 overflow-x-auto"
                        >
                          {code}
                        </pre>
                      );
                    }
                    return (
                      <p key={i} className="text-slate-300">
                        {block}
                      </p>
                    );
                  })}
                </div>

                <div className="text-[10px] text-slate-500 text-right">{m.timestamp}</div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/[0.06] text-xs text-slate-300 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
              <span>Structuring exam solution with formulas & common mistakes...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Chips (if conversation is short) */}
      {messages.length <= 3 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar shrink-0">
          <span className="text-[11px] text-slate-400 shrink-0">Suggestions:</span>
          {INITIAL_SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(s)}
              className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-[11px] text-slate-300 hover:text-white shrink-0 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="glass-card p-2 rounded-2xl border border-white/[0.08] flex items-center gap-2 shrink-0 bg-[#13131F]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a concept, algorithm proof, or exam-style doubt..."
          className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={isLoading || !input.trim()}
          className="h-9 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-violet-600/30 transition-all disabled:opacity-40"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeysUpdated={refreshKeyStatus}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 text-sm">
          Loading AI Tutor...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
