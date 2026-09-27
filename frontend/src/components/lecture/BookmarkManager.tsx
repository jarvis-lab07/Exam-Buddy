"use client";

import React, { useState } from "react";
import {
  Bookmark,
  BookmarkPlus,
  Clock,
  Play,
  Trash2,
  Tag,
  Plus,
  Sparkles,
} from "lucide-react";
import { TimestampBookmark, formatTimestamp } from "@/lib/youtube-service";
import { cn } from "@/lib/utils";

interface BookmarkManagerProps {
  bookmarks: TimestampBookmark[];
  currentTimestampSec: number;
  onSelectBookmark: (timestampSec: number) => void;
  onAddBookmark: (bookmark: TimestampBookmark) => void;
  onDeleteBookmark: (id: string) => void;
}

const BOOKMARK_TYPES: { id: TimestampBookmark["type"]; label: string; color: string }[] = [
  { id: "Important", label: "Important", color: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
  { id: "Formula", label: "Formula", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { id: "Definition", label: "Definition", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
  { id: "Doubt", label: "Doubt", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  { id: "Example", label: "Example", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  { id: "Trick", label: "Trick", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  { id: "PYQ", label: "PYQ", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  { id: "Revision", label: "Revision", color: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
];

export function BookmarkManager({
  bookmarks,
  currentTimestampSec,
  onSelectBookmark,
  onAddBookmark,
  onDeleteBookmark,
}: BookmarkManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<TimestampBookmark["type"]>("Important");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newBookmark: TimestampBookmark = {
      id: `bm-${Date.now()}`,
      timestampSec: currentTimestampSec,
      timestampFormatted: formatTimestamp(currentTimestampSec),
      title: title.trim(),
      type,
      description: description.trim() || undefined,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    onAddBookmark(newBookmark);
    setTitle("");
    setDescription("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-400" />
            Lecture Timestamp Bookmarks ({bookmarks.length})
          </h3>
          <p className="text-[11px] text-[#9B99B5]">
            Click any timestamp bookmark to seek the YouTube video immediately to that moment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Bookmark ({formatTimestamp(currentTimestampSec)})</span>
        </button>
      </div>

      {/* Add Bookmark Form Modal / Card */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="glass-card p-4 rounded-2xl border border-violet-500/30 bg-violet-500/[0.04] space-y-3 animate-[fadeIn_0.2s_ease-out]"
        >
          <div className="flex items-center justify-between text-xs font-bold text-violet-300">
            <span>New Bookmark at {formatTimestamp(currentTimestampSec)}</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-[#9B99B5] hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div>
            <input
              type="text"
              placeholder="Bookmark Title (e.g., AVL Balance Factor Equation)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#13131F] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500"
              autoFocus
              required
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[10px] font-bold text-[#9B99B5] uppercase shrink-0 mr-1">
              Category:
            </span>
            {BOOKMARK_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all shrink-0",
                  type === t.id
                    ? t.color
                    : "bg-white/[0.03] text-[#9B99B5] border-white/[0.06] hover:text-white"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div>
            <input
              type="text"
              placeholder="Optional notes or formula description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#13131F] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md"
            >
              Save Bookmark
            </button>
          </div>
        </form>
      )}

      {/* Bookmark Items List */}
      {bookmarks.length === 0 ? (
        <div className="glass-card p-8 rounded-2xl border border-white/[0.08] text-center text-[#5A5875]">
          <Bookmark className="w-6 h-6 mx-auto mb-2 opacity-50 text-amber-400" />
          <p className="text-xs font-semibold">No bookmarks saved yet for this lecture.</p>
          <p className="text-[11px] mt-1 opacity-70">
            Click the Bookmark button while watching to jump back to high-yield moments later!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookmarks.map((bm) => {
            const badge = BOOKMARK_TYPES.find((t) => t.id === bm.type) || BOOKMARK_TYPES[0];
            return (
              <div
                key={bm.id}
                onClick={() => onSelectBookmark(bm.timestampSec)}
                className="glass-card p-3.5 rounded-xl border border-white/[0.08] hover:border-amber-500/40 hover:bg-white/[0.04] transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono text-xs font-bold shrink-0">
                    <Play className="w-2.5 h-2.5 fill-amber-300" />
                    {bm.timestampFormatted}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white truncate">{bm.title}</span>
                      <span className={cn("text-[9px] font-bold px-2 py-0.2 rounded-md border", badge.color)}>
                        {bm.type}
                      </span>
                    </div>
                    {bm.description && (
                      <p className="text-[11px] text-[#9B99B5] mt-0.5 truncate">{bm.description}</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBookmark(bm.id);
                  }}
                  className="p-1.5 rounded-lg text-[#5A5875] hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                  title="Delete bookmark"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
