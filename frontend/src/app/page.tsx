"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Flame,
  CheckCircle2,
  Trophy,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  ArrowRight,
  FileText,
  FileSpreadsheet,
  FileQuestion,
  Layers,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  PlayCircle,
  ExternalLink,
  Target,
  Calendar,
} from "lucide-react";
import {
  MOCK_USER,
  MOCK_QUICK_METRICS,
  MOCK_SUBJECTS,
  MOCK_WEEKLY_STUDY,
  MOCK_RECENT_DOCUMENTS,
  MOCK_TODAY_TASKS,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [tasks, setTasks] = useState(MOCK_TODAY_TASKS);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const getMetricIcon = (id: string) => {
    switch (id) {
      case "study_time":
        return <Clock className="w-5 h-5 text-indigo-400" />;
      case "streak":
        return <Flame className="w-5 h-5 text-amber-400 fill-amber-400/20" />;
      case "mastery":
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case "accuracy":
        return <Trophy className="w-5 h-5 text-cyan-400" />;
      default:
        return <TrendingUp className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-4 h-4 text-rose-400" />;
      case "ppt":
        return <FileSpreadsheet className="w-4 h-4 text-amber-400" />;
      case "notes":
        return <Layers className="w-4 h-4 text-emerald-400" />;
      default:
        return <FileText className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Welcome & Spaced Repetition Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl glass-card p-6 sm:p-8 border border-white/[0.1] bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-violet-950/30">
        {/* Glow ambient background inside card */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
              <span>Smart Revision Assistant</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {MOCK_USER.name}! 👋
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              You have <span className="font-semibold text-cyan-300">3 exam topics</span> scheduled for spaced revision today. Keep your <span className="font-semibold text-amber-300">7-Day streak</span> going!
            </p>

            {/* Quick Cohort & Exam Countdown Meta */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-400" />
                Semester 3 Midterms: <strong className="text-slate-200">Oct 18, 2026</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-violet-400" />
                AI Mastery Prediction: <strong className="text-emerald-400">89% Target</strong>
              </span>
            </div>
          </div>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <Link
              href="/planner"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start Daily Revision</span>
            </Link>

            <Link
              href="/chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-slate-200 hover:text-white font-medium text-sm transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Ask AI Tutor</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. 4 Quick-Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_QUICK_METRICS.map((metric) => (
          <div
            key={metric.id}
            className="glass-card-interactive p-5 rounded-2xl relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
                {metric.label}
              </span>
              <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] group-hover:scale-110 transition-transform">
                {getMetricIcon(metric.id)}
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold text-white tracking-tight">
                {metric.value}
              </div>

              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  {metric.trendType === "positive" && (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  {metric.trendText}
                </span>

                {metric.badgeText && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.06] text-slate-200 border border-white/[0.08]">
                    {metric.badgeText}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 3. Middle Section: Weekly Study Chart & Today's Revision Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Study Minutes Bar Chart */}
        <section className="lg:col-span-2 glass-card p-6 rounded-3xl border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  Weekly Study Activity
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Total <span className="text-indigo-300 font-semibold">26.3 hrs</span> logged this week • Daily goal: 2.5 hrs
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +14% vs Last Week
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="mt-6 pt-4 border-t border-white/[0.05]">
              <div className="flex items-end justify-between gap-2 h-44 px-2">
                {MOCK_WEEKLY_STUDY.map((day) => {
                  const maxMinutes = 320;
                  const heightPercent = Math.min(100, Math.round((day.minutes / maxMinutes) * 100));
                  const isHovered = hoveredDay === day.day;

                  return (
                    <div
                      key={day.day}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                      onMouseEnter={() => setHoveredDay(day.day)}
                      onMouseLeave={() => setHoveredDay(null)}
                    >
                      {/* Floating tooltip on hover */}
                      <div
                        className={cn(
                          "text-[10px] font-mono px-2 py-1 rounded-md bg-slate-800 text-white border border-white/[0.1] shadow-lg mb-2 transition-all duration-200 pointer-events-none whitespace-nowrap",
                          isHovered || day.isToday
                            ? "opacity-100 -translate-y-1"
                            : "opacity-0 translate-y-1"
                        )}
                      >
                        {(day.minutes / 60).toFixed(1)} hrs
                      </div>

                      {/* Bar fill */}
                      <div className="w-full max-w-[40px] bg-slate-800/80 rounded-xl p-1 relative overflow-hidden flex items-end h-full">
                        <div
                          className={cn(
                            "w-full rounded-lg transition-all duration-500",
                            day.isToday
                              ? "bg-gradient-to-t from-indigo-600 via-violet-500 to-cyan-400 shadow-md shadow-indigo-500/30"
                              : "bg-gradient-to-t from-slate-700 to-slate-600 group-hover:from-indigo-600/70 group-hover:to-violet-500/70"
                          )}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      {/* Day Label */}
                      <div className="mt-2 text-center">
                        <span
                          className={cn(
                            "text-xs font-medium block",
                            day.isToday
                              ? "text-indigo-300 font-bold"
                              : "text-slate-400 group-hover:text-slate-200"
                          )}
                        >
                          {day.day}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" />
              Active Day (Target Met)
            </span>
            <span className="font-mono text-[11px]">Consistent Streak: 7 Days</span>
          </div>
        </section>

        {/* Today's Scheduled Tasks / Spaced Revision */}
        <section className="glass-card p-6 rounded-3xl border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-400" />
                Today&apos;s Revision
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                {tasks.filter((t) => t.completed).length}/{tasks.length} Completed
              </span>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    "p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none",
                    task.completed
                      ? "bg-emerald-950/20 border-emerald-500/20 opacity-60"
                      : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.07]"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex items-center justify-center w-5 h-5 rounded-lg border transition-colors",
                      task.completed
                        ? "bg-emerald-500 border-emerald-400 text-black"
                        : "border-slate-600 hover:border-indigo-400"
                    )}
                  >
                    {task.completed && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                        style={{
                          backgroundColor: `${task.subjectColor}20`,
                          color: task.subjectColor,
                          border: `1px solid ${task.subjectColor}40`,
                        }}
                      >
                        {task.subjectName}
                      </span>
                      <span className="text-[11px] text-slate-400">{task.dueText}</span>
                    </div>

                    <p
                      className={cn(
                        "text-xs font-medium mt-1 leading-snug truncate",
                        task.completed ? "line-through text-slate-400" : "text-slate-200"
                      )}
                    >
                      {task.topicTitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/planner"
            className="mt-4 pt-3 border-t border-white/[0.05] inline-flex items-center justify-between text-xs font-semibold text-indigo-400 hover:text-indigo-300 group"
          >
            <span>View Full Study Planner</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>
      </div>

      {/* 4. Continue Studying: Active Subjects Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Continue Studying
            </h2>
            <p className="text-xs text-slate-400">
              Pick up right where you left off across Semester 3 courses
            </p>
          </div>

          <Link
            href="/subjects"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            <span>All Subjects</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_SUBJECTS.map((subject) => (
            <div
              key={subject.id}
              className="glass-card-interactive p-5 rounded-2xl relative overflow-hidden group border border-white/[0.08]"
            >
              {/* Subtle top accent highlight */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: subject.accentColor }}
              />

              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                      style={{
                        backgroundColor: `${subject.accentColor}20`,
                        color: subject.accentColor,
                        border: `1px solid ${subject.accentColor}40`,
                      }}
                    >
                      {subject.code}
                    </span>
                    <span className="text-xs text-slate-400">{subject.category}</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {subject.name}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-400 block font-mono">
                    Unit {subject.completedUnits}/{subject.totalUnits} done
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {subject.masteredTopics}/{subject.totalTopics} topics
                  </span>
                </div>
              </div>

              {/* Active Unit Context Box */}
              <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium truncate">
                    Unit {subject.currentUnit.unitNumber}: {subject.currentUnit.title}
                  </span>
                  <span className="text-indigo-300 font-mono font-semibold ml-2">
                    {subject.currentUnit.progressPercentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${subject.currentUnit.progressPercentage}%`,
                      backgroundColor: subject.accentColor,
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Last active: {subject.lastAccessed}
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/chat?subject=${subject.id}`}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Ask Doubt</span>
                  </Link>

                  <Link
                    href={`/subjects/${subject.id}`}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 hover:text-white border border-indigo-500/40 text-xs font-semibold transition-all flex items-center gap-1 group/btn"
                  >
                    <span>Resume Unit</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Recent Uploaded Documents List */}
      <section className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Recent Course Documents
            </h2>
            <p className="text-xs text-slate-400">
              AI-processed lecture notes, slides, and cheat sheets ready for query
            </p>
          </div>

          <Link
            href="/upload"
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>Upload New File</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MOCK_RECENT_DOCUMENTS.map((doc) => (
            <div
              key={doc.id}
              className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.12] transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] shrink-0">
                  {getDocIcon(doc.fileType)}
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                    {doc.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span
                      className="font-medium"
                      style={{ color: doc.subjectColor }}
                    >
                      {doc.subjectCode}
                    </span>
                    <span>•</span>
                    <span>{doc.fileSize}</span>
                    <span>•</span>
                    <span>{doc.uploadDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {doc.aiSummaryReady && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    <Sparkles className="w-3 h-3" />
                    AI Ready
                  </span>
                )}

                <Link
                  href={`/chat?doc=${doc.id}`}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                  title="Ask AI about this document"
                >
                  <FileQuestion className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 transition-colors" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
