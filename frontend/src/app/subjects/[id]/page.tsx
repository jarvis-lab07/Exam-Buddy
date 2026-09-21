"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Calendar,
  Layers,
  FileText,
  TrendingUp,
} from "lucide-react";
import { MOCK_SUBJECTS } from "@/lib/mock-data";
import { UnitListItem } from "@/components/subjects/UnitListItem";

export default function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const subject =
    MOCK_SUBJECTS.find((s) => s.id === resolvedParams.id) || MOCK_SUBJECTS[0];

  const units = subject.units || [];
  const subjectColor = subject.color || subject.accentColor || "#6366F1";

  const totalProgress = units.length > 0
    ? Math.round(units.reduce((acc, u) => acc + u.progressPercentage, 0) / units.length)
    : 65;

  return (
    <div className="space-y-6 pb-16">
      <Link
        href="/subjects"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to All Subjects
      </Link>

      {/* Header Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/[0.08] space-y-4 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: subjectColor }}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
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
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/[0.05] text-slate-300 border border-white/[0.08]">
              {subject.degree}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {subject.semesterOrYear}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target Exam: {subject.examDate || subject.nextExamDate}</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {subject.title || subject.name}
          </h1>
          {subject.category && (
            <p className="text-sm text-slate-400 mt-1">{subject.category}</p>
          )}
        </div>

        {/* Progress Bar & CTA */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Syllabus Readiness: {totalProgress}%
            </span>
            <span className="text-slate-400 font-mono">
              {units.length} Curriculum Units
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
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
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Launch AI Study Assistant
          </Link>
          <Link
            href={`/upload?subject=${subject.id}`}
            className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-medium border border-white/[0.08] flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            Upload Course Materials
          </Link>
        </div>
      </div>

      {/* Unit Syllabus Tree */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}
