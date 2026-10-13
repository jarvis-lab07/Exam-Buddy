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
  ChevronDown,
  Zap,
  Cpu,
  Layers,
  GraduationCap,
  Scale,
  Code2,
  RefreshCw,
  FileText,
  HelpCircle,
  Compass,
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
import { retrieveRagContext, buildRagSystemPrompt, type ChatScope, type ExplanationLevel } from "@/lib/rag-service";

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
  ragSourcesCount?: number;
}

// ─── Enhanced Markdown Renderer (Headers, Lists, Code Blocks, Tables) ────────

function renderMarkdown(text: string, onCopyCode?: (code: string) => void): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 1. Fenced Code Block with Header and Copy Button
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      const rawCode = codeLines.join("\n");
      nodes.push(
        <div key={`code-${i}`} className="my-3.5 rounded-xl overflow-hidden border border-[var(--border-card)] bg-[#121320] shadow-sm">
          <div className="flex items-center justify-between px-3.5 py-1.5 bg-white/[0.04] border-b border-white/[0.06] text-[11px] text-slate-400 font-mono">
            <span className="uppercase tracking-wider font-semibold text-violet-400">{lang || "code"}</span>
            {onCopyCode && (
              <button
                type="button"
                onClick={() => onCopyCode(rawCode)}
                className="flex items-center gap-1.5 hover:text-white transition-colors py-0.5 px-1.5 rounded hover:bg-white/[0.06]"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            )}
          </div>
          <pre className="p-4 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
            {rawCode}
          </pre>
        </div>
      );
      i++;
      continue;
    }

    // 2. Markdown Table Detection & Structured Rendering
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const tableRows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        const rawRow = lines[i].trim();
        // Ignore separator row like | :--- | :--- |
        if (!rawRow.match(/^\|(\s*:?-+:?\s*\|)+$/)) {
          const cells = rawRow
            .slice(1, -1)
            .split("|")
            .map((c) => c.trim());
          tableRows.push(cells);
        }
        i++;
      }

      if (tableRows.length > 0) {
        const [headers, ...bodyRows] = tableRows;
        nodes.push(
          <div key={`table-${i}`} className="my-4 overflow-x-auto rounded-xl border border-[var(--border-card)] bg-[var(--bg-elevated)]/40 shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-card)] bg-white/[0.04]">
                  {headers.map((h, hIdx) => (
                    <th key={hIdx} className="p-3 font-bold text-[var(--text-primary)] tracking-wide">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-card)]/50">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3 text-[var(--text-secondary)] leading-relaxed">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // 3. Headers
    if (line.startsWith("### ")) {
      nodes.push(
        <h4
          key={`h3-${i}`}
          className="text-[var(--text-primary)] font-bold text-sm mt-5 mb-2 flex items-center gap-2 border-b border-[var(--border-card)] pb-1"
        >
          {renderInline(line.slice(4))}
        </h4>
      );
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      nodes.push(
        <h3 key={`h2-${i}`} className="text-[var(--text-primary)] font-extrabold text-base mt-6 mb-2">
          {renderInline(line.slice(3))}
        </h3>
      );
      i++;
      continue;
    }

    // 4. Unordered Lists
    if (line.match(/^[\-\*] /)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^[\-\*] /)) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="my-2.5 space-y-1.5 pl-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-[var(--text-primary)] text-sm flex gap-2.5 leading-relaxed">
              <span className="text-violet-400 font-bold mt-1 shrink-0">•</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 5. Ordered Lists
    if (line.match(/^\d+\. /)) {
      const listItems: Array<{ num: string; text: string }> = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        const match = lines[i].match(/^(\d+)\. (.*)/)!;
        listItems.push({ num: match[1], text: match[2] });
        i++;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="my-2.5 space-y-1.5 pl-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-[var(--text-primary)] text-sm flex gap-2.5 leading-relaxed">
              <span className="text-violet-400 font-semibold shrink-0 min-w-[1.2rem]">{item.num}.</span>
              <span>{renderInline(item.text)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 6. Horizontal Rule
    if (line.match(/^---+$/)) {
      nodes.push(<hr key={`hr-${i}`} className="my-4 border-[var(--border-card)]" />);
      i++;
      continue;
    }

    // 7. Spacer
    if (!line.trim()) {
      nodes.push(<div key={`sp-${i}`} className="h-1.5" />);
      i++;
      continue;
    }

    // 8. Regular Paragraph
    nodes.push(
      <p key={`p-${i}`} className="text-[var(--text-primary)] text-sm leading-relaxed mb-1">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return nodes;
}

function formatMath(expr: string): string {
  return expr
    .replace(/\\mathbf\{([^}]+)\}/g, "$1")
    .replace(/\\mathbb\{R\}\^([a-zA-Z0-9]+)/g, "ℝ^$1")
    .replace(/\\mathbb\{R\}/g, "ℝ")
    .replace(/\\mathbb\{([A-Z])\}/g, "$1")
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\sigma/g, "σ")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\gamma/g, "γ")
    .replace(/\\delta/g, "δ")
    .replace(/\\theta/g, "θ")
    .replace(/\\eta/g, "η")
    .replace(/\\lambda/g, "λ")
    .replace(/\\mu/g, "μ")
    .replace(/\\nabla/g, "∇")
    .replace(/\\partial/g, "∂")
    .replace(/\\sum/g, "∑")
    .replace(/\\prod/g, "∏")
    .replace(/\\infty/g, "∞")
    .replace(/\\in/g, "∈")
    .replace(/\\notin/g, "∉")
    .replace(/\\le(q)?/g, "≤")
    .replace(/\\ge(q)?/g, "≥")
    .replace(/\\ne(q)?/g, "≠")
    .replace(/\\approx/g, "≈")
    .replace(/\\times/g, "×")
    .replace(/\\cdot/g, "·")
    .replace(/\\leftarrow/g, "←")
    .replace(/\\rightarrow/g, "→")
    .replace(/\\to/g, "→")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)")
    .replace(/\\hat\{([^}]+)\}/g, "$1̂")
    .replace(/\\log/g, "log")
    .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
    .replace(/\\{1,2}/g, "")
    .trim();
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\$\$.*?\$\$|\$.*?\$|\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("$$") && part.endsWith("$$") && part.length > 4) {
      const math = formatMath(part.slice(2, -2));
      return (
        <span
          key={i}
          className="my-1.5 px-2 py-1 rounded-lg bg-violet-950/40 border border-violet-500/25 text-cyan-200 font-mono text-xs block text-center shadow-2xs"
        >
          {math}
        </span>
      );
    }
    if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
      const math = formatMath(part.slice(1, -1));
      return (
        <span
          key={i}
          className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-violet-500/15 border border-violet-500/25 text-cyan-300 font-mono text-[11px] font-medium align-baseline shadow-2xs"
        >
          {math}
        </span>
      );
    }
    if (part.startsWith("***") && part.endsWith("***"))
      return <strong key={i} className="font-bold italic text-[var(--text-primary)]">{part.slice(3, -3)}</strong>;
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold text-[var(--text-primary)]">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i} className="italic text-emerald-400">{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={i} className="px-1.5 py-0.5 rounded-md bg-violet-500/15 text-violet-300 font-mono text-[11px] border border-violet-500/20">
          {part.slice(1, -1)}
        </code>
      );
    return part;
  });
}

function TypingCursor() {
  return (
    <span className="inline-block w-1 h-3.5 bg-violet-400 ml-1 animate-pulse align-middle rounded-xs" />
  );
}

// ─── Scope & Level Labels ───────────────────────────────────────────────────

const SCOPE_LABELS: Record<ChatScope, { label: string; desc: string; icon: any }> = {
  scope1_unit: { label: "Unit Focus", desc: "Deep drilldown on selected study module", icon: BookOpen },
  scope2_multi_unit: { label: "Multi-Unit", desc: "Cross-chapter midterm revision synthesis", icon: Layers },
  scope3_subject: { label: "Full Subject", desc: "Course syllabus exam strategist", icon: GraduationCap },
  scope4_global: { label: "Global Tutor", desc: "Cross-disciplinary university mentor", icon: Compass },
};

const LEVEL_LABELS: Record<ExplanationLevel, { label: string; desc: string }> = {
  simple: { label: "Simple", desc: "Beginner-friendly analogies & intuitive logic" },
  medium: { label: "Conceptual", desc: "Engineering depth, formulas & diagrams" },
  exam: { label: "5/10-Mark Exam", desc: "University structured format & marking rubrics" },
};

// ─── Hero Starter Prompts ───────────────────────────────────────────────────

const HERO_STARTERS = [
  {
    icon: FileText,
    title: "10-Mark Exam Model Answer",
    prompt: "Explain 4 Coffman conditions for Deadlock with deadlock prevention strategies and a university exam diagram.",
    tag: "Exam Format",
  },
  {
    icon: Zap,
    title: "Algorithm Trace & Complexity",
    prompt: "Dijkstra vs Bellman-Ford: compare time complexities, negative cycle handling, and step-by-step algorithm trace.",
    tag: "Algorithms",
  },
  {
    icon: Scale,
    title: "Concept Comparison Matrix",
    prompt: "Compare Process vs Thread in Operating Systems with memory space, context switching overhead, and IPC table.",
    tag: "OS & Arch",
  },
  {
    icon: Code2,
    title: "Data Structure Balance Trace",
    prompt: "How do AVL tree rotations (LL, RR, LR, RL) restore height balance? Show step-by-step balance factor traces.",
    tag: "Data Structures",
  },
];

// ─── Chat Content ─────────────────────────────────────────────────────────────

function ChatContent() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get("subject");
  const queryParam = searchParams.get("q");

  const [activeScope, setActiveScope] = useState<ChatScope>("scope1_unit");
  const [explanationLevel, setExplanationLevel] = useState<ExplanationLevel>("medium");
  const [selectedSubject, setSelectedSubject] = useState<string>(subjectParam || "all");
  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<AIProvider>("gemini");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dropdown states for compact header controls
  const [isScopeOpen, setIsScopeOpen] = useState(false);
  const [isLevelOpen, setIsLevelOpen] = useState(false);

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
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  };

  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
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

      const fileMatch = text.match(/([a-zA-Z0-9_\-]+\.(pdf|pptx|ppt|docx|doc|txt))/i);
      const docNameFromPrompt = fileMatch ? fileMatch[1] : undefined;

      const ragMatches = await retrieveRagContext(
        text,
        activeScope,
        docNameFromPrompt ? undefined : selectedSubject !== "all" ? selectedSubject : undefined
      );

      const activeSubjectObj = MOCK_SUBJECTS.find((s) => s.id === selectedSubject);
      const effectiveSubjectName = docNameFromPrompt
        ? `Uploaded Document (${docNameFromPrompt})`
        : activeSubjectObj?.name;
      const effectiveUnitTitle = docNameFromPrompt
        ? `Document: ${docNameFromPrompt}`
        : activeSubjectObj?.currentUnit?.title;

      const systemPrompt = buildRagSystemPrompt(
        activeScope,
        explanationLevel,
        ragMatches,
        effectiveSubjectName,
        effectiveUnitTitle
      );

      const history = messages
        .filter((m) => !m.isStreaming && !m.isError)
        .slice(-6)
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
            const raw = line.replace(/^data:\s*/, "").trim();
            if (!raw || raw === "[DONE]") continue;
            try {
              const json = JSON.parse(raw);
              if (json.error) {
                fullContent = `### ⚠️ Could Not Complete Request\n\n**${json.error}**\n\n#### 💡 Troubleshooting:\n- Add **multiple API keys** for the same provider to avoid rate limits\n- Switch to a different provider in the header\n- If using Ollama, run \`ollama serve\` in your terminal`;
                hasError = true;
                break;
              }
              if (json.delta) {
                fullContent += json.delta;
                const currentText = fullContent;
                requestAnimationFrame(() => {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId ? { ...m, content: currentText, isStreaming: true } : m
                    )
                  );
                });
              }
            } catch {}
          }
          if (hasError) break;
        }

        if (!hasError && buf.trim()) {
          const raw = buf.replace(/^data:\s*/, "").trim();
          if (raw && raw !== "[DONE]") {
            try {
              const json = JSON.parse(raw);
              if (json.error) {
                fullContent = `### ⚠️ Could Not Complete Request\n\n**${json.error}**`;
                hasError = true;
              } else if (json.delta) {
                fullContent += json.delta;
              }
            } catch {}
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          // User stopped
        } else {
          fullContent = `### ⚠️ Connection Error\n\n**${err instanceof Error ? err.message : "Unknown error"}**\n\nPlease check your internet connection and API key.`;
          hasError = true;
        }
      }

      const latencyMs = Date.now() - startTime;
      const modelName = `${AI_PROVIDERS[activeProvider]?.name || activeProvider}`;
      const trimmedFinalContent = fullContent.trim();
      const finalContent =
        trimmedFinalContent ||
        (hasError
          ? "⚠️ An error occurred while communicating with the AI service. Please check your network or try another provider."
          : "⚠️ No response was received from the AI provider. The model may be rate-limited or the API key quota exhausted. Please check your key in AI Manager or switch to Groq in the top header.");

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: finalContent,
                isStreaming: false,
                isError: hasError || !trimmedFinalContent,
                model: modelName,
                latencyMs,
              }
            : m
        )
      );

      setIsLoading(false);
      abortRef.current = null;
    },
    [input, isLoading, messages, activeScope, explanationLevel, selectedSubject, activeProvider]
  );

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
    setMessages([]);
  };

  const keyCount = typeof window !== "undefined" ? getStoredApiKeys(activeProvider).length : 0;
  const ScopeIcon = SCOPE_LABELS[activeScope].icon;

  return (
    <div className="w-full h-[calc(100dvh-6.5rem)] sm:h-[calc(100dvh-7.5rem)] lg:h-[calc(100dvh-8.5rem)] flex flex-col rounded-2xl border border-[var(--border-card)] bg-[var(--bg-base)] overflow-hidden shadow-2xl relative">
      {/* ── 1. Slim, Modern Sticky Top Toolbar ── */}
      <header className="h-14 px-4 sm:px-6 border-b border-[var(--border-card)] bg-[var(--bg-surface)]/80 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 z-20">
        {/* Left: Brand & Model Identifier */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-white tracking-tight">AI Tutor</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25 hidden sm:inline-block">
              RAG 4-Scope
            </span>
          </div>
        </div>

        {/* Center / Right: Clean Interactive Configuration Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Scope Selector Pill */}
          <div className="relative">
            <button
              onClick={() => {
                setIsScopeOpen(!isScopeOpen);
                setIsLevelOpen(false);
              }}
              className="h-8 px-2.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-white/[0.08] border border-[var(--border-card)] text-xs text-slate-200 flex items-center gap-1.5 transition-all"
            >
              <ScopeIcon className="w-3.5 h-3.5 text-violet-400" />
              <span className="font-medium">{SCOPE_LABELS[activeScope].label}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isScopeOpen && (
              <div className="absolute right-0 top-10 w-64 p-1.5 rounded-2xl bg-[#181928] border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                {(Object.keys(SCOPE_LABELS) as ChatScope[]).map((scopeKey) => {
                  const item = SCOPE_LABELS[scopeKey];
                  const Icon = item.icon;
                  const isSelected = activeScope === scopeKey;
                  return (
                    <button
                      key={scopeKey}
                      onClick={() => {
                        setActiveScope(scopeKey);
                        setIsScopeOpen(false);
                      }}
                      className={`w-full p-2 rounded-xl text-left transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                          : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold">{item.label}</div>
                        <div className={`text-[10px] leading-tight ${isSelected ? "text-violet-200" : "text-slate-400"}`}>
                          {item.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Depth / Format Pill */}
          <div className="relative">
            <button
              onClick={() => {
                setIsLevelOpen(!isLevelOpen);
                setIsScopeOpen(false);
              }}
              className="h-8 px-2.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-white/[0.08] border border-[var(--border-card)] text-xs text-slate-200 flex items-center gap-1.5 transition-all"
            >
              <span className="text-slate-400 text-[11px]">Format:</span>
              <span className="font-medium text-emerald-400">{LEVEL_LABELS[explanationLevel].label}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isLevelOpen && (
              <div className="absolute right-0 top-10 w-56 p-1.5 rounded-2xl bg-[#181928] border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                {(Object.keys(LEVEL_LABELS) as ExplanationLevel[]).map((lvlKey) => {
                  const item = LEVEL_LABELS[lvlKey];
                  const isSelected = explanationLevel === lvlKey;
                  return (
                    <button
                      key={lvlKey}
                      onClick={() => {
                        setExplanationLevel(lvlKey);
                        setIsLevelOpen(false);
                      }}
                      className={`w-full p-2 rounded-xl text-left transition-all ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                          : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <div className="text-xs font-semibold">{item.label}</div>
                      <div className={`text-[10px] ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                        {item.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="h-8 px-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-card)] text-xs text-slate-200 focus:outline-none focus:border-violet-500/50 cursor-pointer hidden md:block"
          >
            <option value="all">All Subjects</option>
            {MOCK_SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}: {s.name}
              </option>
            ))}
          </select>

          {/* Provider & Key Status */}
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="h-8 px-2.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-white/[0.08] border border-[var(--border-card)] text-xs text-slate-200 flex items-center gap-1.5 transition-all"
            title="Configure AI Engine API Keys"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-medium hidden sm:inline-block">
              {AI_PROVIDERS[activeProvider].name.split(" ")[0]}
            </span>
            {keyCount > 0 ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="hidden md:inline">Add Key</span>
              </span>
            )}
          </button>

          {/* Clear Chat */}
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              title="Clear current conversation"
              className="h-8 w-8 rounded-xl bg-[var(--bg-elevated)] hover:bg-red-500/15 hover:border-red-500/30 border border-[var(--border-card)] text-slate-400 hover:text-red-400 flex items-center justify-center transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* ── 2. Comfortable, Expansive Chat Reading Canvas ── */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-44 space-y-6"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Welcome / Hero Starter State (Displayed before first query) */}
          {messages.length === 0 && (
            <div className="py-10 text-center space-y-8 animate-in fade-in duration-300">
              <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/30 shadow-lg shadow-violet-500/10">
                <Bot className="w-8 h-8 text-violet-400" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  What concept are we mastering today?
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Grounded in your university syllabus, verified textbooks, and past exam questions. Select a prompt below or ask anything.
                </p>
              </div>

              {/* 4 Interactive Hero Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
                {HERO_STARTERS.map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="p-4 rounded-2xl bg-[var(--bg-card)] hover:bg-white/[0.06] border border-[var(--border-card)] hover:border-violet-500/40 text-left transition-all duration-200 group flex flex-col justify-between space-y-3 shadow-xs hover:shadow-lg hover:shadow-violet-500/5 hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="p-2 rounded-xl bg-violet-600/15 text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                          <ItemIcon className="w-4 h-4" />
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 group-hover:text-violet-300 transition-colors">
                          {item.tag}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                          {item.prompt}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Message Stream */}
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3.5 ${
                  isUser ? "flex-row-reverse" : "flex-row"
                } group animate-in fade-in duration-200`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    isUser
                      ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white"
                      : "bg-[#1f2033] text-violet-400 border border-violet-500/30"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div className="max-w-[88%] sm:max-w-[82%] space-y-1.5 text-left">
                  {/* Assistant Meta Header */}
                  {!isUser && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 pl-1">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        Exam-Buddy AI
                      </span>
                      {m.model && (
                        <span className="px-1.5 py-0.2 rounded bg-white/[0.05] font-mono text-[10px] text-slate-400">
                          {m.model}
                        </span>
                      )}
                      {m.latencyMs && (
                        <span className="text-[10px] text-slate-500">
                          ⚡ {(m.latencyMs / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message Bubble Content */}
                  <div
                    className={`rounded-2xl p-4 text-sm leading-relaxed shadow-xs text-left ${
                      isUser
                        ? "bg-violet-600 text-white font-medium rounded-tr-xs shadow-md"
                        : m.isError
                        ? "bg-red-500/10 border border-red-500/30 text-slate-200 rounded-tl-xs"
                        : "bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-primary)] rounded-tl-xs"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap text-left break-words">{m.content}</p>
                    ) : (
                      <div className="space-y-1">
                        {m.content ? renderMarkdown(m.content, (code) => copyMessage(`code-${Date.now()}`, code)) : null}
                        {m.isStreaming && <TypingCursor />}
                      </div>
                    )}
                  </div>

                  {/* Assistant Footer Action Toolbar */}
                  {!isUser && !m.isStreaming && m.content && (
                    <div className="flex items-center gap-1.5 pt-1 pl-1 text-[11px] text-slate-400 flex-wrap">
                      <button
                        type="button"
                        onClick={() => copyMessage(m.id, m.content)}
                        className="p-1 px-2 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                        title="Copy answer to clipboard"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleSendMessage(
                            `Please reformat the above explanation into a high-scoring University Exam 10-Mark Answer structure (Formal Definition, Architecture/Block Diagram description, Step-by-Step Logic, Pros/Cons, and Practical Example).`
                          )
                        }
                        className="p-1 px-2 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                        title="Format as university exam 10-mark answer"
                      >
                        <FileText className="w-3 h-3 text-violet-400" />
                        <span>Format as 10-Mark</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleSendMessage(
                            `Can you explain the core principle of the above answer in a simpler way using an intuitive real-world analogy?`
                          )
                        }
                        className="p-1 px-2 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                        title="Explain with simple analogy"
                      >
                        <HelpCircle className="w-3 h-3 text-emerald-400" />
                        <span>Simpler Analogy</span>
                      </button>

                      <span className="text-[10px] text-slate-500 ml-auto mr-1">{m.timestamp}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Thinking Animation (while waiting for first streaming token) */}
          {isLoading && !messages.find((m) => m.isStreaming && m.content.length > 0) && (
            <div className="flex items-start gap-3.5 animate-in fade-in">
              <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center gap-2 text-xs text-slate-400 rounded-tl-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
                <span>Searching syllabus notes & generating response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── 3. Floating Modern Input Dock (ChatGPT / Claude Style) ── */}
      <footer className="absolute bottom-0 inset-x-0 p-3 sm:px-6 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/95 to-transparent pt-8 pointer-events-none z-10">
        <div className="max-w-3xl mx-auto space-y-2 pointer-events-auto">
          {/* Capsule Input Container */}
          <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-elevated)] shadow-xl p-2.5 transition-all focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/10">
            {/* Active Mode Pills bar inside input */}
            <div className="flex items-center gap-1.5 px-2 pb-1.5 text-[10px] text-slate-400 border-b border-white/[0.05] overflow-x-auto no-scrollbar">
              <span className="font-semibold text-violet-400 flex items-center gap-1">
                <ScopeIcon className="w-3 h-3" />
                {SCOPE_LABELS[activeScope].label}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-medium">
                {LEVEL_LABELS[explanationLevel].label}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 truncate max-w-[140px]">
                {selectedSubject === "all" ? "All Subjects" : selectedSubject}
              </span>
            </div>

            {/* Textarea + Action Button Row */}
            <div className="flex items-end gap-2 pt-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask any concept, algorithm, exam question... (Shift+Enter for newline)"
                rows={1}
                className="flex-1 bg-transparent px-2 py-1.5 text-sm text-[var(--text-primary)] placeholder-slate-500 focus:outline-none resize-none min-h-[38px] max-h-[160px] leading-relaxed"
              />

              <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
                {isLoading ? (
                  <button
                    onClick={stopGeneration}
                    className="h-9 px-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-red-600/20"
                  >
                    <span className="w-2 h-2 rounded-xs bg-white inline-block" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!input.trim()}
                    className="h-9 w-9 sm:w-auto sm:px-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:hover:bg-violet-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-violet-600/30"
                  >
                    <span className="hidden sm:inline">Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Micro Footer Legend */}
          <div className="flex items-center justify-between px-2 text-[10px] text-slate-500">
            <span>Enter to send • Shift+Enter for new line</span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-violet-400" />
              <span>{AI_PROVIDERS[activeProvider]?.name || "Google Gemini"}</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Modal */}
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
        <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
          <span>Loading AI Tutor...</span>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
