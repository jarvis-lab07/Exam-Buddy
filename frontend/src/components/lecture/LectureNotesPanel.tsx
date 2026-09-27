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
          title: `${type.toUpperCase()} Notes — [${formatTimestamp(currentTimestampSec)}]`,
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
          {notes.map((note) => (
            <div
              key={note.id}
              className="glass-card p-4 rounded-2xl border border-white/[0.08] space-y-2 bg-white/[0.02]"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{note.title}</span>
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

              <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                {note.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
