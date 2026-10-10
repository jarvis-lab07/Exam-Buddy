"use client";

import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  BookOpen,
} from "lucide-react";
import { LectureNote, formatTimestamp } from "@/lib/youtube-service";
import { aiGateway } from "@/lib/ai-gateway";

interface LectureNotesPanelProps {
  notes: LectureNote[];
  currentTimestampSec: number;
  lectureTitle: string;
  onAddNote: (note: LectureNote) => void;
  onDeleteNote: (id: string) => void;
}

function formatLaTeXMath(raw: string): string {
  return raw
    .replace(/\\int_\{([^}]+)\}\^\{([^}]+)\}/g, "∫ ($1 → $2)")
    .replace(/\\int_\{([^}]+)\}/g, "∫ ($1)")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)")
    .replace(/\\left\[/g, "[")
    .replace(/\\right\]/g, "]")
    .replace(/\\left\(/g, "(")
    .replace(/\\right\)/g, ")")
    .replace(/\\cdot/g, " · ")
    .replace(/\\pi/g, "π")
    .replace(/\\phi/g, "φ")
    .replace(/\\psi/g, "ψ")
    .replace(/\\,/g, " ")
    .replace(/\\/g, "")
    .trim();
}

function renderFormattedInline(text: string): React.ReactNode {
  const tokens = text.split(/(\$\$.*?\$\$|\$.*?\$|\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return tokens.map((token, idx) => {
    if (!token) return null;

    if (token.startsWith("$$") && token.endsWith("$$")) {
      const mathContent = token.slice(2, -2);
      return (
        <span
          key={idx}
          className="inline-block my-1.5 px-3 py-1.5 rounded-xl bg-violet-950/60 border border-violet-500/40 text-cyan-300 font-mono text-xs tracking-wide shadow-inner"
        >
          {formatLaTeXMath(mathContent)}
        </span>
      );
    }

    if (token.startsWith("$") && token.endsWith("$")) {
      const mathContent = token.slice(1, -1);
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-cyan-950/60 text-cyan-300 font-mono text-[11px] border border-cyan-500/30 shadow-sm"
        >
          {formatLaTeXMath(mathContent)}
        </code>
      );
    }

    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={idx} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    }

    if (token.startsWith("*") && token.endsWith("*")) {
      return (
        <em key={idx} className="italic text-emerald-300">
          {token.slice(1, -1)}
        </em>
      );
    }

    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded-md bg-violet-500/15 text-cyan-300 font-mono text-[11px] border border-violet-500/20"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    return token;
  });
}

function renderNoteMarkdown(content: string): React.ReactNode {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      nodes.push(<div key={`sp-${idx}`} className="h-1" />);
      return;
    }

    if (trimmed.startsWith("### ")) {
      nodes.push(
        <h5 key={`h3-${idx}`} className="text-xs font-bold text-violet-300 mt-2 mb-1 flex items-center gap-1.5">
          {renderFormattedInline(trimmed.slice(4))}
        </h5>
      );
      return;
    }
    if (trimmed.startsWith("## ")) {
      nodes.push(
        <h4 key={`h2-${idx}`} className="text-xs font-extrabold text-white mt-2.5 mb-1 border-b border-white/[0.06] pb-1">
          {renderFormattedInline(trimmed.slice(3))}
        </h4>
      );
      return;
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      nodes.push(
        <div key={`num-${idx}`} className="flex items-start gap-2 my-1 text-xs leading-relaxed text-slate-200">
          <span className="font-bold text-violet-400 shrink-0 mt-0.5">{numMatch[1]}.</span>
          <div>{renderFormattedInline(numMatch[2])}</div>
        </div>
      );
      return;
    }

    const bulletMatch = trimmed.match(/^[\-\*]\s+(.*)/);
    if (bulletMatch) {
      nodes.push(
        <div key={`bullet-${idx}`} className="flex items-start gap-2 my-1 pl-2 text-xs leading-relaxed text-slate-200">
          <span className="text-amber-400 shrink-0 mt-0.5">•</span>
          <div>{renderFormattedInline(bulletMatch[1])}</div>
        </div>
      );
      return;
    }

    nodes.push(
      <p key={`p-${idx}`} className="text-xs text-slate-200 leading-relaxed my-0.5">
        {renderFormattedInline(trimmed)}
      </p>
    );
  });

  return nodes;
}

export function LectureNotesPanel({
  notes,
  currentTimestampSec,
  lectureTitle,
  onAddNote,
  onDeleteNote,
}: LectureNotesPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeGenMode, setActiveGenMode] = useState<LectureNote["type"]>("summary");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerateNotes = async (type: LectureNote["type"]) => {
    setIsGenerating(true);
    setActiveGenMode(type);

    const typePrompt =
      type === "summary"
        ? "Quick Executive Summary (3 key takeaways)"
        : type === "detailed"
        ? "Detailed Academic Notes with headings, formulas, and proofs"
        : type === "exam"
        ? "High-Yield University Exam Revision Notes with predictable exam questions"
        : "Formulas & Equations Cheat Sheet";

    try {
      const res = await aiGateway.execute({
        feature: "notes",
        messages: [
          {
            role: "system",
            content: "You are an expert academic note generator. Generate clear, structured markdown study notes.",
          },
          {
            role: "user",
            content: `Generate ${typePrompt} for the lecture topic "${lectureTitle}" around timestamp [${formatTimestamp(currentTimestampSec)}].`,
          },
        ],
      });

      if (res.text) {
        const newNote: LectureNote = {
          id: `note-${Date.now()}`,
          timestampSec: currentTimestampSec,
          title: `${type.toUpperCase()} Notes`,
          content: res.text,
          type,
          createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        onAddNote(newNote);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* AI Generators Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-white/[0.06] pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-400" />
            Smart Lecture Notes ({notes.length})
          </h3>
          <p className="text-[11px] text-[#9B99B5]">Generate AI notes or save custom study insights.</p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: "summary", label: "Quick Summary" },
            { id: "detailed", label: "Detailed Notes" },
            { id: "exam", label: "Exam Revision" },
            { id: "formula", label: "Formulas" },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => handleGenerateNotes(mode.id as any)}
              disabled={isGenerating}
              className="px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-200 border border-violet-500/40 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="glass-card p-8 rounded-2xl border border-white/[0.08] text-center text-[#5A5875]">
          <FileText className="w-6 h-6 mx-auto mb-2 opacity-50 text-violet-400" />
          <p className="text-xs font-semibold">No notes generated yet for this lecture.</p>
          <p className="text-[11px] mt-1 opacity-70">
            Click one of the AI generator buttons above to instantly generate structured study notes!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const cleanTitle = note.title.replace(/\s*—\s*\[\d+:\d+(?::\d+)?\]/g, "").trim();

            return (
              <div
                key={note.id}
                className="glass-card p-4 rounded-2xl border border-white/[0.08] space-y-2 bg-white/[0.02]"
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{cleanTitle}</span>
                    {note.timestampSec !== undefined && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25">
                        [{formatTimestamp(note.timestampSec)}]
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(note.id, note.content)}
                      className="p-1.5 rounded-lg text-[#9B99B5] hover:text-white hover:bg-white/[0.06] transition-colors"
                      title="Copy note markdown"
                    >
                      {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1.5 rounded-lg text-[#5A5875] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  {renderNoteMarkdown(note.content)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
