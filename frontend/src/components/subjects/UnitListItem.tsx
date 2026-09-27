"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Unit } from "@/types";
import { cn } from "@/lib/utils";
import {
  Bot,
  Layers,
  UploadCloud,
  CheckCircle2,
  Clock,
  CircleDashed,
  FileText,
  MoreHorizontal,
  Trash2,
  GripVertical,
  Check,
} from "lucide-react";

interface UnitListItemProps {
  unit: Unit;
  subjectId: string;
  subjectColor: string;
  onRemove?: (subjectId: string, unitId: string) => void;
  onToggleStatus?: (subjectId: string, unitId: string) => void;
}

export function UnitListItem({
  unit,
  subjectId,
  subjectColor,
  onRemove,
  onToggleStatus,
}: UnitListItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const getStatusBadge = (status: Unit["status"]) => {
    switch (status) {
      case "mastered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Mastered (100%)
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            In Progress ({unit.progressPercentage}%)
          </span>
        );
      case "not_started":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">
            <CircleDashed className="w-3 h-3" />
            Not Started
          </span>
        );
    }
  };

  const handleRemoveConfirm = () => {
    if (!onRemove) return;
    onRemove(subjectId, unit.id);
    setConfirmRemove(false);
    setMenuOpen(false);
  };

  return (
    <div className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] transition-all space-y-3 group">
      {/* Top Row: Unit Title & Status + Actions Menu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="flex items-center justify-center w-6 h-6 rounded-lg text-xs font-mono font-bold shrink-0"
            style={{
              backgroundColor: `${subjectColor}20`,
              color: subjectColor,
              border: `1px solid ${subjectColor}40`,
            }}
          >
            U{unit.unitNumber}
          </span>
          <h4 className="text-sm font-bold text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
            {unit.title}
          </h4>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {getStatusBadge(unit.status)}

          {(onRemove || onToggleStatus) && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => { setMenuOpen((v) => !v); setConfirmRemove(false); }}
                className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all opacity-60 group-hover:opacity-100"
                title="Unit actions"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 z-30 w-52 rounded-2xl border border-white/[0.1] bg-[#0D111D]/95 backdrop-blur-xl shadow-2xl p-1.5 space-y-0.5 animate-[fadeIn_0.12s_ease-out]">
                  {onToggleStatus && unit.status !== "mastered" && (
                    <button
                      type="button"
                      onClick={() => { onToggleStatus(subjectId, unit.id); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Mark as Mastered
                    </button>
                  )}
                  {onToggleStatus && unit.status === "mastered" && (
                    <button
                      type="button"
                      onClick={() => { onToggleStatus(subjectId, unit.id); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 transition-colors"
                    >
                      <CircleDashed className="w-3.5 h-3.5 text-amber-400" />
                      Reset to Not Started
                    </button>
                  )}

                  {onRemove && (
                    <>
                      {!confirmRemove ? (
                        <button
                          type="button"
                          onClick={() => setConfirmRemove(true)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          Remove Unit
                        </button>
                      ) : (
                        <div className="p-2.5 space-y-2">
                          <div className="text-[11px] text-rose-300 font-semibold leading-snug">
                            Permanently remove Unit {unit.unitNumber}?
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmRemove(false)}
                              className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-semibold text-slate-200 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveConfirm}
                              className="flex-1 px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-[11px] font-bold text-white transition-colors"
                            >
                              Yes, Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Topics Tags Pills */}
      {unit.topics && unit.topics.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {unit.topics.map((topic, index) => (
            <span
              key={index}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 border border-white/[0.05] transition-colors"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Row: Resource counts & Action Shortcuts */}
      <div className="pt-2 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Resource Meta */}
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            {unit.notesCount} notes
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            {unit.flashcardsCount} flashcards
          </span>
        </div>

        {/* Quick Launch Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href={`/chat?subject=${subjectId}&unit=${unit.unitNumber}`}
            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Tutor</span>
          </Link>

          <Link
            href={`/flashcards?subject=${subjectId}&unit=${unit.unitNumber}`}
            className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Flashcards</span>
          </Link>

          <Link
            href={`/upload?subject=${subjectId}&unit=${unit.unitNumber}`}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
