"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

interface SubjectCardProps {
  subject: Subject;
  defaultExpanded?: boolean;
}

export function SubjectCard({ subject, defaultExpanded = false }: SubjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

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

  return (
    <div className="glass-card rounded-3xl border border-white/[0.08] overflow-hidden transition-all duration-300 hover:border-white/[0.15]">
      {/* Top Accent Stripe */}
      <div
        className="h-1.5 w-full transition-all"
        style={{ backgroundColor: subjectColor }}
      />

      {/* Card Header Content */}
      <div className="p-6 space-y-4">
        {/* Row 1: Code, Degree, Term & Exam Countdown */}
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

          {/* Exam Countdown Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Exam: {subject.examDate || subject.nextExamDate}</span>
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
        <div className="pt-2 flex items-center justify-between gap-3">
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
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
