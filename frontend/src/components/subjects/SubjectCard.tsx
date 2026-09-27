"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Subject } from "@/types";
import { UnitListItem } from "./UnitListItem";
import { cn } from "@/lib/utils";
import {
  Calendar,
  BookOpen,
  FileText,
  Layers,
  ChevronDown,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  MoreHorizontal,
  Trash2,
  UploadCloud,
  Eye,
  Copy,
  Award,
  Bot,
} from "lucide-react";

interface SubjectCardProps {
  subject: Subject;
  defaultExpanded?: boolean;
  onDeleteSubject?: (id: string) => void;
  onDuplicateSubject?: (subject: Subject) => void;
  onMarkExamDone?: (id: string) => void;
  onRemoveUnit?: (subjectId: string, unitId: string) => void;
  onToggleUnitStatus?: (subjectId: string, unitId: string) => void;
}

export function SubjectCard({
  subject,
  defaultExpanded = false,
  onDeleteSubject,
  onDuplicateSubject,
  onMarkExamDone,
  onRemoveUnit,
  onToggleUnitStatus,
}: SubjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  // Calculate stats dynamically from units if present
  const units = subject.units || [];
  const totalUnits = units.length || subject.totalUnits || 0;
  const masteredUnits = units.filter((u) => u.status === "mastered").length;
  const inProgressUnits = units.filter((u) => u.status === "in_progress").length;
  
  const totalNotes = units.reduce((acc, u) => acc + (u.notesCount || 0), 0);
  const totalFlashcards = units.reduce((acc, u) => acc + (u.flashcardsCount || 0), 0);

  // Calculate overall mastery percentage
  const totalProgress = units.length > 0
    ? Math.round(units.reduce((acc, u) => acc + u.progressPercentage, 0) / units.length)
    : Math.round(((subject.masteredTopics || 0) / (subject.totalTopics || 1)) * 100);

  const subjectColor = subject.color || subject.accentColor || "#6366F1";

  const handleDelete = () => {
    if (!onDeleteSubject) return;
    onDeleteSubject(subject.id);
    setConfirmDelete(false);
    setMenuOpen(false);
  };

  const handleDuplicate = () => {
    if (!onDuplicateSubject) return;
    onDuplicateSubject(subject);
    setMenuOpen(false);
  };

  const handleMarkDone = () => {
    if (!onMarkExamDone) return;
    onMarkExamDone(subject.id);
    setMenuOpen(false);
  };

  return (
    <div className="glass-card rounded-2xl border border-white/[0.08] overflow-hidden transition-all duration-300 hover:border-white/[0.15]">
      {/* Top Accent Stripe */}
      <div
        className="h-1.5 w-full transition-all"
        style={{ backgroundColor: subjectColor }}
      />

      {/* Card Header Content */}
      <div className="p-6 space-y-4">
        {/* Row 1: Code, Degree, Term & Exam Countdown + Actions Menu */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold"
              style={{
                backgroundColor: `${subjectColor}12`,
                color: subjectColor,
                border: `1px solid ${subjectColor}40`,
              }}
            >
              {subject.code}
            </span>

            {subject.courseCode && (
              <span className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-semibold bg-slate-600/30 text-slate-200 border border-slate-500/30">
                {subject.courseCode}
              </span>
            )}

            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/[0.05] text-slate-300 border border-white/[0.08]">
              {subject.degree}
            </span>

            <span className="text-xs text-slate-400 font-medium">
              {subject.semesterOrYear}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Exam Countdown Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Exam: {subject.examDate || subject.nextExamDate}</span>
            </div>

            {/* More Actions Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => { setMenuOpen((v) => !v); setConfirmDelete(false); }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all"
                title="Subject actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-30 w-56 rounded-2xl border border-white/[0.1] bg-[#0D111D]/95 backdrop-blur-xl shadow-2xl p-1.5 space-y-0.5 animate-[fadeIn_0.12s_ease-out]">
                  <Link
                    href={`/subjects/${subject.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/[0.06] hover:text-white transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    View Full Details
                  </Link>
                  <Link
                    href={`/chat?subject=${subject.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/[0.06] hover:text-white transition-colors"
                  >
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    Ask AI Tutor
                  </Link>
                  <Link
                    href={`/upload?subject=${subject.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/[0.06] hover:text-white transition-colors"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                    Upload Materials
                  </Link>
                  <Link
                    href={`/flashcards?subject=${subject.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/[0.06] hover:text-white transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    Open Flashcards
                  </Link>

                  {onDuplicateSubject && (
                    <button
                      type="button"
                      onClick={handleDuplicate}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/[0.06] hover:text-white transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      Duplicate Subject
                    </button>
                  )}

                  {onMarkExamDone && (
                    <button
                      type="button"
                      onClick={handleMarkDone}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 transition-colors"
                    >
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      Mark Exam Completed
                    </button>
                  )}

                  <div className="h-px my-1 bg-white/[0.06]" />

                  {onDeleteSubject && (
                    confirmDelete ? (
                      <div className="p-2.5 space-y-2">
                        <div className="text-[11px] text-rose-300 font-semibold leading-snug">
                          Delete &ldquo;{subject.title || subject.name}&rdquo;? All {totalUnits} units, {totalNotes} notes &amp; {totalFlashcards} cards will be removed.
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(false)}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-semibold text-slate-200 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleDelete}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-[11px] font-bold text-white transition-colors"
                          >
                            Confirm Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        Remove Subject
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Title & Category */}
        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
            {subject.title || subject.name}
          </h3>
          {subject.category && (
            <p className="text-xs text-slate-400 mt-0.5">{subject.category}</p>
          )}
        </div>

        {/* Row 3: Mastery Progress & Resource Counts */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Syllabus Exam Readiness</span>
            </div>
            <span
              className="font-mono font-bold text-sm"
              style={{ color: subjectColor }}
            >
              {totalProgress}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-800/90 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${totalProgress}%`,
                backgroundColor: subjectColor,
              }}
            />
          </div>

          {/* Resource Stat Pills */}
          <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <strong className="text-slate-200">{masteredUnits}/{totalUnits}</strong> Units Mastered
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <strong className="text-slate-200">{totalNotes}</strong> Notes
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <strong className="text-slate-200">{totalFlashcards}</strong> Cards
              </span>
            </div>

            {inProgressUnits > 0 && (
              <span className="text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                {inProgressUnits} unit in revision
              </span>
            )}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
          {/* Toggle Syllabus Units Accordion */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-slate-200 hover:text-white border border-white/[0.07] flex items-center gap-2 transition-all"
          >
            <span>{isExpanded ? "Hide Syllabus Tree" : `Explore Syllabus (${totalUnits} Units)`}</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-300 text-slate-400",
                isExpanded && "rotate-180 text-indigo-400"
              )}
            />
          </button>

          <Link
            href={`/subjects/${subject.id}`}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-cyan-200 hover:text-white border border-cyan-500/20 hover:border-cyan-500/40 flex items-center gap-1.5 transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-300" />
            <span>Open Details</span>
          </Link>

          {/* AI Tutor Chat Launch */}
          <Link
            href={`/chat?subject=${subject.id}`}
            className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 hover:text-white border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Ask AI Tutor</span>
          </Link>
        </div>
      </div>

      {/* Expandable Syllabus Units Tree */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-white/[0.06] bg-black/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between pt-2 pb-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Unit Syllabus & Topic Checklist
            </h4>
            <span className="text-[11px] text-slate-500">
              Click unit buttons to study with AI
            </span>
          </div>

          <div className="space-y-2.5">
            {units.map((unit) => (
              <UnitListItem
                key={unit.id}
                unit={unit}
                subjectId={subject.id}
                subjectColor={subjectColor}
                onRemove={onRemoveUnit}
                onToggleStatus={onToggleUnitStatus}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
