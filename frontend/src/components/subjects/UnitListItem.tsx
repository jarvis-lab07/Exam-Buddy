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
  Award,
} from "lucide-react";
import { ExamAnswerStructurerModal } from "./ExamAnswerStructurerModal";

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
  const [isStructurerOpen, setIsStructurerOpen] = useState(false);
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
    <div className="p-4 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] border border-[var(--border-card)] transition-all space-y-3 group shadow-xs">
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
          <h4 className="text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-indigo-500 transition-colors">
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
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent hover:border-[var(--border-card)] transition-all opacity-80 group-hover:opacity-100"
                title="Unit actions"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 z-30 w-52 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-surface)] backdrop-blur-xl shadow-2xl p-1.5 space-y-0.5 animate-[fadeIn_0.12s_ease-out]">
                  {onToggleStatus && unit.status !== "mastered" && (
                    <button
                      type="button"
                      onClick={() => { onToggleStatus(subjectId, unit.id); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Mark as Mastered
                    </button>
                  )}
                  {onToggleStatus && unit.status === "mastered" && (
                    <button
                      type="button"
                      onClick={() => { onToggleStatus(subjectId, unit.id); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 transition-colors"
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
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          Remove Unit
                        </button>
                      ) : (
                        <div className="p-2.5 space-y-2">
                          <div className="text-[11px] text-rose-400 font-semibold leading-snug">
                            Permanently remove Unit {unit.unitNumber}?
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmRemove(false)}
                              className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--border-card)] text-[11px] font-semibold text-[var(--text-secondary)] transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveConfirm}
                              className="flex-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-[11px] font-bold text-white transition-colors"
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
        <div className="flex wrap items-center gap-1.5 pt-1">
          {unit.topics.map((topic, index) => (
            <span
              key={index}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[var(--bg-elevated)] hover:bg-[var(--border-card)] text-[var(--text-secondary)] border border-[var(--border-card)] transition-colors"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Row: Resource counts & Action Shortcuts */}
      <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Resource Meta */}
        <div className="flex items-center gap-3 text-[var(--text-muted)] text-[11px]">
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
          <button
            type="button"
            onClick={() => setIsStructurerOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/30 text-emerald-500 dark:text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition-all"
            title="Format 5/10-Mark University Answer & Formula Sheet"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">5/10M Answer</span>
            <span className="sm:hidden">5/10M</span>
          </button>

          <Link
            href={`/chat?subject=${subjectId}&unit=${unit.unitNumber}`}
            className="px-2.5 py-1 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/30 text-indigo-500 dark:text-indigo-300 border border-indigo-500/30 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Tutor</span>
          </Link>

          <Link
            href={`/flashcards?subject=${subjectId}&unit=${unit.unitNumber}`}
            className="px-2.5 py-1 rounded-lg bg-purple-600/15 hover:bg-purple-600/30 text-purple-500 dark:text-purple-300 border border-purple-500/30 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Flashcards</span>
          </Link>

          <Link
            href={`/upload?subject=${subjectId}&unit=${unit.unitNumber}`}
            className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--border-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-card)] text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload</span>
          </Link>
        </div>
      </div>

      {/* 5/10-Mark Answer Structurer Modal */}
      <ExamAnswerStructurerModal
        isOpen={isStructurerOpen}
        onClose={() => setIsStructurerOpen(false)}
        subjectTitle={subjectId}
        unitTitle={`Unit ${unit.unitNumber}: ${unit.title}`}
        topicTitle={unit.topics?.[0] || unit.title}
      />
    </div>
  );
}
