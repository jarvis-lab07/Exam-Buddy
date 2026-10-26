"use client";

export const runtime = 'edge';

import React, { use, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Calendar,
  Layers,
  FileText,
  TrendingUp,
  Trash2,
  Copy,
  Award,
  MoreHorizontal,
  ArrowLeftCircle,
  Eye,
  UploadCloud,
  Bot,
} from "lucide-react";
import { MOCK_SUBJECTS } from "@/lib/mock-data";
import { getUserSubjects, saveUserSubjects } from "@/lib/subject-service";
import { UnitListItem } from "@/components/subjects/UnitListItem";
import { PyqFrequencyModal } from "@/components/subjects/PyqFrequencyModal";
import { ExamAnswerStructurerModal } from "@/components/subjects/ExamAnswerStructurerModal";
import { Subject } from "@/types";
import { cn } from "@/lib/utils";

export default function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [subjectsState, setSubjectsState] = useState<Subject[]>(MOCK_SUBJECTS);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPyqOpen, setIsPyqOpen] = useState(false);
  const [isStructurerOpen, setIsStructurerOpen] = useState(false);

  useEffect(() => {
    const load = () => {
      const list = getUserSubjects();
      if (list && list.length > 0) {
        setSubjectsState(list);
      }
    };
    load();
    window.addEventListener("exam_buddy_subjects_updated", load);
    return () => window.removeEventListener("exam_buddy_subjects_updated", load);
  }, []);

  const subject = useMemo(
    () => subjectsState.find((s) => s.id === resolvedParams.id) || subjectsState[0] || MOCK_SUBJECTS[0],
    [subjectsState, resolvedParams.id]
  );

  const units = subject.units || [];
  const subjectColor = subject.color || subject.accentColor || "#6366F1";

  const totalUnits = units.length || subject.totalUnits || 0;
  const totalNotes = units.reduce((acc, u) => acc + (u.notesCount || 0), 0);
  const totalFlashcards = units.reduce((acc, u) => acc + (u.flashcardsCount || 0), 0);

  const totalProgress = units.length > 0
    ? Math.round(units.reduce((acc, u) => acc + u.progressPercentage, 0) / units.length)
    : 65;

  const handleRemoveUnit = (subjectId: string, unitId: string) => {
    setSubjectsState((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        const nextUnits = (s.units || []).filter((u) => u.id !== unitId);
        return {
          ...s,
          units: nextUnits,
          totalUnits: nextUnits.length,
          totalTopics: nextUnits.length * 3,
        };
      })
    );
  };

  const handleToggleUnitStatus = (subjectId: string, unitId: string) => {
    setSubjectsState((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          units: (s.units || []).map((u) => {
            if (u.id !== unitId) return u;
            if (u.status === "mastered") {
              return { ...u, status: "not_started" as const, progressPercentage: 0 };
            }
            return { ...u, status: "mastered" as const, progressPercentage: 100 };
          }),
        };
      })
    );
  };

  const handleDuplicate = () => {
    const timestamp = Date.now();
    const copy: Subject = {
      ...subject,
      id: `sub-${timestamp}`,
      name: `${subject.name || subject.title || "Subject"} (Copy)`,
      title: `${subject.title || subject.name || "Subject"} (Copy)`,
      code: `${subject.code}-COPY`,
      lastAccessed: "Just now",
      units: units.map((u, i) => ({
        ...u,
        id: `copy-${timestamp}-u${i + 1}`,
        status: "not_started" as const,
        progressPercentage: 0,
      })),
    };
    setSubjectsState((prev) => [copy, ...prev]);
    router.push(`/subjects/${copy.id}`);
  };

  const handleMarkExamDone = () => {
    setSubjectsState((prev) =>
      prev.map((s) =>
        s.id === subject.id
          ? {
              ...s,
              completedUnits: s.units?.length || s.totalUnits || 0,
              masteredTopics: s.totalTopics || 0,
              units: (s.units || []).map((u) => ({
                ...u,
                status: "mastered" as const,
                progressPercentage: 100,
              })),
              category: `${s.category || ""}`.trim() || "Completed Course",
            }
          : s
      )
    );
    setMenuOpen(false);
  };

  const handleDeleteSubject = () => {
    setSubjectsState((prev) => prev.filter((s) => s.id !== subject.id));
    router.push("/subjects");
  };

  return (
    <div className="space-y-6 pb-16">
      <Link
        href="/subjects"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to All Subjects
      </Link>

      {/* Header Card */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-[var(--border-card)] border-t-2 border-indigo-500/40 space-y-4 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: subjectColor }}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold"
              style={{
                backgroundColor: `${subjectColor}20`,
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
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--input-bg)] text-[var(--text-secondary)] border border-[var(--border-card)]">
              {subject.degree}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              {subject.semesterOrYear}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Exam: {subject.examDate || subject.nextExamDate}</span>
            </div>

            {/* More Actions */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setMenuOpen((v) => !v); setConfirmDelete(false); }}
                className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent hover:border-[var(--border-card)] transition-all"
                title="Subject actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-30 w-56 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-elevated)] backdrop-blur-xl shadow-2xl p-1.5 space-y-0.5 animate-[fadeIn_0.12s_ease-out]">
                  <Link
                    href={`/chat?subject=${subject.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
                  >
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    Launch AI Tutor
                  </Link>
                  <Link
                    href={`/upload?subject=${subject.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                    Upload Materials
                  </Link>
                  <Link
                    href={`/flashcards?subject=${subject.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    Flashcard Drill
                  </Link>

                  <button
                    type="button"
                    onClick={handleDuplicate}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/[0.06] hover:text-white transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    Duplicate Subject
                  </button>

                  <button
                    type="button"
                    onClick={handleMarkExamDone}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 transition-colors"
                  >
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    Mark Exam Completed
                  </button>

                  <div className="h-px my-1 bg-white/[0.06]" />

                  {confirmDelete ? (
                    <div className="p-2.5 space-y-2">
                      <div className="text-[11px] text-rose-300 font-semibold leading-snug">
                        Delete &ldquo;{subject.title || subject.name}&rdquo;? All {totalUnits} units, {totalNotes} notes &amp; {totalFlashcards} cards will be removed.
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--input-bg)] hover:bg-[var(--bg-card)] border border-[var(--border-card)] text-[11px] font-semibold text-[var(--text-secondary)] transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteSubject}
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
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            {subject.title || subject.name}
          </h1>
          {subject.category && (
            <p className="text-sm text-[var(--text-muted)] mt-1">{subject.category}</p>
          )}
        </div>

        {/* Progress Bar & CTA */}
        <div className="p-4 rounded-2xl bg-[var(--input-bg)]/50 border border-[var(--border-card)] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Syllabus Readiness: {totalProgress}%
            </span>
            <span className="text-[var(--text-muted)] font-mono">
              {units.length} Curriculum Units
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--input-bg)] overflow-hidden border border-[var(--border-subtle)]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalProgress}%`,
                backgroundColor: subjectColor,
              }}
            />
          </div>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            href={`/chat?subject=${subject.id}`}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Launch AI Study Assistant
          </Link>

          {/* PYQ Frequency Radar Button */}
          <button
            type="button"
            onClick={() => setIsPyqOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
            title="5-Year PYQ Frequency Radar & Mistake Notebook"
          >
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>PYQ Frequency Radar</span>
          </button>

          {/* 5/10-Mark Answer Structurer Button */}
          <button
            type="button"
            onClick={() => setIsStructurerOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
            title="University 5/10-Mark Answer Structurer & Formula Sheet"
          >
            <Award className="w-4 h-4 text-emerald-400" />
            <span>5/10M Answer Structurer</span>
          </button>

          <Link
            href={`/upload?subject=${subject.id}`}
            className="px-4 py-2.5 rounded-xl bg-[var(--input-bg)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium border border-[var(--border-card)] flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            Upload Course Materials
          </Link>
        </div>
      </div>

      {/* Unit Syllabus Tree */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          Units & Topic Modules ({units.length})
        </h2>

        <div className="space-y-3">
          {units.map((unit) => (
            <UnitListItem
              key={unit.id}
              unit={unit}
              subjectId={subject.id}
              subjectColor={subjectColor}
              onRemove={handleRemoveUnit}
              onToggleStatus={handleToggleUnitStatus}
            />
          ))}
        </div>
      </div>

      {/* 5-Year PYQ Radar Modal */}
      <PyqFrequencyModal
        isOpen={isPyqOpen}
        onClose={() => setIsPyqOpen(false)}
        subjectCode={subject.code}
        subjectTitle={subject.title || subject.name}
      />

      {/* 5/10-Mark Answer Structurer & Formula Sheet Modal */}
      <ExamAnswerStructurerModal
        isOpen={isStructurerOpen}
        onClose={() => setIsStructurerOpen(false)}
        subjectTitle={subject.title || subject.name}
        unitTitle={units[0]?.title || "Unit 1: Core Fundamentals"}
        topicTitle={units[0]?.topics?.[0] || `${subject.title || subject.name} Key Concept`}
      />
    </div>
  );
}
