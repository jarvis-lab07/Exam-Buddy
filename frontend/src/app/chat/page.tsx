"use client";

import React, { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bot,
  Sparkles,
  Send,
  User,
  Key,
  Copy,
  Check,
  Loader2,
  BookOpen,
  Trash2,
  Plus,
  ChevronDown,
  Zap,
  Globe,
  Cpu,
} from "lucide-react";
import {
  getActiveProvider,
  getStoredApiKey,
  getStoredApiKeys,
  AI_PROVIDERS,
  getOllamaEndpoint,
  getOllamaModel,
  getSelectedModel,
  type AIProvider,
} from "@/lib/ai-service";
import { MOCK_SUBJECTS } from "@/lib/mock-data";
import { ApiKeyModal } from "@/components/ai/ApiKeyModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  latencyMs?: number;
  isStreaming?: boolean;
  isError?: boolean;
  timestamp: string;
}

// ─── Markdown renderer (bold, code, headers, lists, inline code) ──────────────

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      nodes.push(
        <pre
          key={`code-${i}`}
          className="my-3 p-4 rounded-xl bg-[#060610] border border-violet-500/10 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed"
        >
          {lang && (
            <span className="block text-[10px] text-violet-400 mb-2 uppercase tracking-widest font-semibold">
              {lang}
            </span>
          )}
          {codeLines.join("\n")}
        </pre>
      );
      i++;
      continue;
    }

    // H3 header
    if (line.startsWith("### ")) {
      nodes.push(
        <h4
          key={`h3-${i}`}
          className="text-white font-bold text-sm mt-4 mb-1.5 flex items-center gap-2 border-b border-white/[0.06] pb-1"
        >
          {renderInline(line.slice(4))}
        </h4>
      );
      i++;
      continue;
    }

    // H2 header
    if (line.startsWith("## ")) {
      nodes.push(
        <h3 key={`h2-${i}`} className="text-white font-extrabold text-base mt-4 mb-1">
          {renderInline(line.slice(3))}
        </h3>
      );
      i++;
      continue;
    }

    // Unordered list
    if (line.match(/^[\-\*] /)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^[\-\*] /)) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="my-2 space-y-1 pl-4">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-slate-300 text-sm flex gap-2">
              <span className="text-violet-400 mt-1 shrink-0">•</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\. /)) {
      const listItems: Array<{ num: string; text: string }> = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        const match = lines[i].match(/^(\d+)\. (.*)/)!;
        listItems.push({ num: match[1], text: match[2] });
        i++;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="my-2 space-y-1 pl-4">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-slate-300 text-sm flex gap-2">
              <span className="text-violet-400 font-bold shrink-0">{item.num}.</span>
              <span>{renderInline(item.text)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      nodes.push(<hr key={`hr-${i}`} className="my-3 border-white/[0.07]" />);
      i++;
      continue;
    }

    // Empty line → spacer
    if (!line.trim()) {
      nodes.push(<div key={`sp-${i}`} className="h-1" />);
      i++;
      continue;
    }

    // Regular paragraph
    nodes.push(
      <p key={`p-${i}`} className="text-slate-300 text-sm leading-relaxed">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return nodes;
}

function renderInline(text: string): React.ReactNode {
  // Handle bold+italic, bold, italic, inline code
  const parts = text.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("***") && part.endsWith("***"))
      return <strong key={i} className="font-bold italic text-white">{part.slice(3, -3)}</strong>;
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i} className="italic text-violet-200">{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={i} className="px-1.5 py-0.5 rounded-md bg-violet-500/15 text-cyan-300 font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    return part;
  });
}

// ─── Typing cursor ────────────────────────────────────────────────────────────

function TypingCursor() {
  return (
    <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 animate-pulse align-text-bottom" />
  );
}

// ─── Build system prompt ──────────────────────────────────────────────────────

function buildSystemPrompt(scopeTitle: string, syllabusContext: string, chatMode: string): string {
  if (chatMode === "general") {
    return `You are Exam-Buddy AI, a smart, friendly academic tutor for university students. You answer clearly and helpfully in well-structured markdown. Use emojis sparingly for clarity. Keep answers concise but thorough.`;
  }
  return `You are Exam-Buddy AI Tutor, an elite university academic assistant specialized for: "${scopeTitle}".
${syllabusContext ? `\nRelevant topics from the course:\n${syllabusContext}` : ""}

Answer student queries with exam-oriented precision. Use clean markdown with headers, bullet points, code blocks, and formulas where appropriate. Highlight common exam pitfalls and likely questions when relevant.`;
}

// ─── Suggestions ─────────────────────────────────────────────────────────────

const INITIAL_SUGGESTIONS = [
  "Dijkstra vs Bellman-Ford — time complexity comparison",
  "Explain 4 Coffman conditions for Deadlock with example",
  "How do AVL tree rotations restore balance? Show trace",
  "TCP 3-way handshake with sequence numbers",
  "Banker's algorithm — find safe sequence for 3 processes",
  "Difference between process and thread in OS",
];

// ─── Chat Content ─────────────────────────────────────────────────────────────

function ChatContent() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get("subject");
  const queryParam = searchParams.get("q");

  const [chatMode, setChatMode] = useState<"general" | "subject">("subject");
  const [selectedSubject, setSelectedSubject] = useState<string>(subjectParam || "all");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your **Exam-Buddy AI Tutor** 👋\n\nI'm here to help you with any concept, algorithm, exam question, or topic from your syllabus. I have full **conversation memory** — so you can ask follow-ups just like with ChatGPT.\n\n**Getting started:**\n- Ask any concept or past-year question\n- Switch to **Subject Chat** to get syllabus-aligned answers\n- Add multiple API keys below for uninterrupted usage",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [syllabusText, setSyllabusText] = useState("");
  const [activeProvider, setActiveProvider] = useState<AIProvider>("gemini");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const refreshKeyStatus = useCallback(() => {
    const prov = getActiveProvider();
    setActiveProvider(prov);
    const key = getStoredApiKey(prov);
    setHasApiKey(Boolean(key));
  }, []);

  useEffect(() => {
    refreshKeyStatus();
  }, [refreshKeyStatus]);

  useEffect(() => {
    if (queryParam) handleSendMessage(queryParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParam]);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  };

  // Resolve scope
  const resolveScope = useCallback((): { scopeTitle: string; syllabusContext: string } => {
    if (chatMode === "general") return { scopeTitle: "General", syllabusContext: "" };
    if (selectedSubject === "all") return { scopeTitle: "All Semester 3 Subjects", syllabusContext: "" };

    const custom = typeof window !== "undefined" ? localStorage.getItem("customSyllabus") : null;
    const customData = custom ? JSON.parse(custom) : null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subj = customData?.subjects?.find((s: any) => s.id === selectedSubject) ||
      MOCK_SUBJECTS.find((s) => s.id === selectedSubject);

    if (!subj) return { scopeTitle: "All Semester 3 Subjects", syllabusContext: "" };
    return {
      scopeTitle: `${subj.code}: ${subj.name}`,
      syllabusContext: (subj.units || [])
        .map((u: { unitNumber: number; title: string; topics: string[] }) => `Unit ${u.unitNumber}: ${u.title} (${u.topics.join(", ")})`)
        .join("\n"),
    };
  }, [chatMode, selectedSubject]);

  const handleSendMessage = useCallback(async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || isLoading) return;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Placeholder streaming message
    const assistantId = `assistant-${Date.now()}`;
    const assistantPlaceholder: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      isStreaming: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    setIsLoading(true);

    const { scopeTitle, syllabusContext } = resolveScope();
    const systemPrompt = buildSystemPrompt(scopeTitle, syllabusContext, chatMode);

    // Build full conversation history for context
    const history = messages
      .filter((m) => !m.isStreaming)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const provider = getActiveProvider();
    const apiKeys = getStoredApiKeys(provider);

    const controller = new AbortController();
    abortRef.current = controller;

    const startTime = Date.now();
    let fullContent = "";
    let hasError = false;

    try {
      const res = await fetch("/api/ai-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          provider,
          apiKeys,
          model: getSelectedModel(provider),
          messages: [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: text },
          ],
          ollamaEndpoint: getOllamaEndpoint(),
          ollamaModel: getOllamaModel(),
        }),
      });

      if (!res.body) throw new Error("No response body from server");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        const lines = buf.split("\n");
        buf = lines.pop() || "";

        for (const line of lines) {
          const raw = line.replace(/^data:\s*/, "");
          if (!raw || raw === "[DONE]") continue;
          try {
            const json = JSON.parse(raw);
            if (json.error) {
              fullContent = `### ⚠️ Could Not Complete Request\n\n**${json.error}**\n\n#### 💡 Troubleshooting:\n- Add **multiple API keys** for the same provider to avoid rate limits\n- Switch to a different provider (Groq is ultra-fast and free)\n- If using Ollama, run \`ollama serve\` in your terminal`;
              hasError = true;
              break;
            }
            if (json.delta) {
              fullContent += json.delta;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: fullContent, isStreaming: true }
                    : m
                )
              );
            }
          } catch {}
        }
        if (hasError) break;
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // User stopped — keep what we have
      } else {
        fullContent = `### ⚠️ Connection Error\n\n**${err instanceof Error ? err.message : "Unknown error"}**\n\nPlease check your internet connection and API key.`;
        hasError = true;
      }
    }

    const latencyMs = Date.now() - startTime;
    const modelName = `${AI_PROVIDERS[activeProvider]?.name || activeProvider}`;

    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantId
          ? {
              ...m,
              content: fullContent || (hasError ? "An error occurred." : "No response generated."),
              isStreaming: false,
              isError: hasError,
              model: modelName,
              latencyMs,
            }
          : m
      )
    );

    setIsLoading(false);
    abortRef.current = null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, isLoading, messages, chatMode, resolveScope, activeProvider]);

  const stopGeneration = () => {
    abortRef.current?.abort();
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
    );
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: "Chat cleared! Start a new conversation. I'm ready to help 🚀",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const keyCount = typeof window !== "undefined" ? getStoredApiKeys(activeProvider).length : 0;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6.5rem)] flex flex-col gap-3">
      {/* ── Top Bar ── */}
      <div className="glass-card px-4 py-3 rounded-2xl border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              AI Tutor Chat
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25">
                GPT-Level
              </span>
            </h1>
            <p className="text-[11px] text-[#9B99B5]">Streaming • Full history • Multi-key rotation</p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06]">
          <button
            onClick={() => setChatMode("general")}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              chatMode === "general"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Globe className="w-3 h-3" /> General
          </button>
          <button
            onClick={() => setChatMode("subject")}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              chatMode === "subject"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-3 h-3" /> Subject
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {chatMode === "subject" && (
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="h-8 px-2.5 rounded-xl bg-[#141624] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-violet-500/40"
            >
              <option value="all">All Subjects</option>
              {MOCK_SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}: {s.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="h-8 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            {hasApiKey ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                {AI_PROVIDERS[activeProvider].name.split(" ")[0]}
                {keyCount > 1 && (
                  <span className="ml-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-1 rounded">
                    {keyCount} keys
                  </span>
                )}
              </span>
            ) : (
              <span className="text-amber-300 font-medium">Add API Key</span>
            )}
          </button>

          <button
            onClick={clearChat}
            title="Clear chat"
            className="h-8 w-8 rounded-xl bg-white/[0.04] hover:bg-red-500/10 hover:border-red-500/30 border border-white/[0.08] text-slate-400 hover:text-red-400 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        ref={scrollAreaRef}
        className="flex-1 glass-card px-4 py-5 rounded-3xl border border-white/[0.08] overflow-y-auto space-y-4 relative"
      >
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} group`}>
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white"
                    : "bg-violet-600/20 text-violet-400 border border-violet-500/30"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                  isUser
                    ? "bg-violet-600/20 border border-violet-500/30 text-white"
                    : m.isError
                    ? "bg-red-500/5 border border-red-500/20 text-slate-200"
                    : "bg-white/[0.03] border border-white/[0.06] text-slate-200"
                }`}
              >
                {/* Assistant header */}
                {!isUser && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.05] text-[11px] text-slate-400">
                    <span className="font-medium text-violet-300 flex items-center gap-1.5">
                      <Zap className="w-3 h-3" />
                      Exam-Buddy AI
                    </span>
                    <div className="flex items-center gap-2">
                      {m.model && <span className="font-mono text-[10px] opacity-70">{m.model}</span>}
                      {m.latencyMs && <span className="opacity-70">{(m.latencyMs / 1000).toFixed(1)}s</span>}
                      <button
                        onClick={() => copyMessage(m.id, m.content)}
                        className="opacity-0 group-hover:opacity-100 hover:text-white transition-all"
                        title="Copy"
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

                {/* Content */}
                {isUser ? (
                  <p className="text-white whitespace-pre-wrap">{m.content}</p>
                ) : (
                  <div className="space-y-1">
                    {m.content ? renderMarkdown(m.content) : null}
                    {m.isStreaming && <TypingCursor />}
                  </div>
                )}

                <div className="text-[10px] text-slate-500 text-right mt-2">{m.timestamp}</div>
              </div>
            </div>
          );
        })}

        {/* Thinking indicator (before first streaming token) */}
        {isLoading && !messages.find((m) => m.isStreaming && m.content.length > 0) && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
              <span>Thinking...</span>
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1 h-1 bg-violet-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggestions ── */}
      {messages.length <= 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar shrink-0">
          <span className="text-[11px] text-slate-500 shrink-0">Try:</span>
          {INITIAL_SUGGESTIONS.slice(0, 4).map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(s)}
              className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-violet-600/10 hover:border-violet-500/30 border border-white/[0.06] text-[11px] text-slate-300 hover:text-white shrink-0 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Input Bar ── */}
      <div className="glass-card px-3 py-2.5 rounded-2xl border border-white/[0.08] bg-[#13131F] shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask any concept, algorithm, exam question... (Shift+Enter for new line)"
            rows={1}
            className="flex-1 bg-transparent px-2 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none resize-none min-h-[36px] max-h-[160px] leading-relaxed"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            {isLoading ? (
              <button
                onClick={stopGeneration}
                className="h-9 px-4 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <span className="w-2 h-2 rounded-sm bg-white inline-block" />
                Stop
              </button>
            ) : (
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim()}
                className="h-9 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-violet-600/30 transition-all"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-1.5 px-2">
          <p className="text-[10px] text-slate-600">
            {isLoading ? (
              <span className="text-violet-400 animate-pulse">⚡ Streaming response...</span>
            ) : (
              "Enter to send • Shift+Enter for new line • Full conversation context kept"
            )}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
            <Cpu className="w-3 h-3" />
            <span>{AI_PROVIDERS[activeProvider]?.name || "No provider"}</span>
            {keyCount > 1 && <span className="text-emerald-500">• {keyCount} keys</span>}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeysUpdated={refreshKeyStatus}
      />
      {isSyllabusModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#141624] rounded-2xl p-6 w-96 border border-white/[0.08]">
            <h2 className="text-base font-semibold text-white mb-3">Upload Custom Syllabus (JSON)</h2>
            <textarea
              className="w-full h-40 p-3 bg-[#0C0C14] text-gray-200 border border-gray-600 rounded-xl text-xs font-mono"
              placeholder='{"subjects":[...]}'
              value={syllabusText}
              onChange={(e) => setSyllabusText(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 text-sm bg-white/[0.06] text-white rounded-xl hover:bg-white/[0.1] transition"
                onClick={() => setIsSyllabusModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-violet-600 text-white rounded-xl hover:bg-violet-500 transition"
                onClick={() => {
                  try {
                    const parsed = JSON.parse(syllabusText);
                    localStorage.setItem("customSyllabus", JSON.stringify(parsed));
                    setIsSyllabusModalOpen(false);
                  } catch {
                    alert("Invalid JSON format");
                  }
                }}
              >
                Save Syllabus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
          Loading AI Tutor...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
