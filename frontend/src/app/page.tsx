"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  Layers,
  MessageSquare,
  BrainCircuit,
  Target,
  Calendar,
  CalendarDays,
  BarChart3,
  Zap,
  Activity,
  ChevronRight,
  Play,
} from "lucide-react";
import {
  MOCK_USER,
  MOCK_QUICK_METRICS,
  MOCK_SUBJECTS,
  MOCK_WEEKLY_STUDY,
  MOCK_RECENT_DOCUMENTS,
  MOCK_TODAY_TASKS,
  MOCK_CALENDAR_EVENTS,
  MOCK_STUDY_STATS,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { DailyGoalRing } from "@/components/focus/DailyGoalRing";
import type { CalendarEvent } from "@/types";

const continueSubjects = MOCK_SUBJECTS.filter((s) => s.degree === "Engineering");

function daysUntil(dateLabel: string) {
  const parsed = new Date(`${dateLabel} 00:00:00`);
  if (Number.isNaN(parsed.getTime())) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((parsed.getTime() - today.getTime()) / 86_400_000));
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState(MOCK_TODAY_TASKS);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [barsReady, setBarsReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setBarsReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const completedCount = tasks.filter((t) => t.completed).length;
  const weekHours = useMemo(
    () => MOCK_WEEKLY_STUDY.reduce((sum, d) => sum + d.minutes, 0) / 60,
    []
  );
  const countdown = daysUntil("Oct 18, 2026");
  const urgentCountdown = countdown <= 14;

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
        return <Clock className="w-5 h-5 text-indigo-400" />;
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

  const metricTrend = (id: string, fallback: string) => {
    if (id === "accuracy") return "Top 5% of cohort 🏅";
    return fallback;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Smart Hero Banner */}
      <section className="relative overflow-hidden card p-6 sm:p-8 border-t-2 border-indigo-500/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 pl-2 pr-3 py-1 rounded-r-full border-l-4 border-indigo-500/60 bg-indigo-500/10 dark:bg-white/[0.03] text-indigo-600 dark:text-[#d9d8e5] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Smart Revision Assistant</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-theme-primary">
              Welcome back, {MOCK_USER.name}.
            </h1>

            <p className="text-theme-secondary text-sm sm:text-base leading-relaxed font-medium">
              You have <strong className="text-theme-primary font-bold">3 exam topics</strong> scheduled
              for spaced revision today. Keep your{" "}
              <strong className="text-theme-primary font-bold">7-day streak</strong> going.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-theme-secondary">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                Sem 3 Midterms — Oct 18, 2026
              </span>
              <span className="hidden sm:inline opacity-40">·</span>
              <span className="flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                AI Mastery Prediction: 89%
              </span>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <Link
              href="/planner"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Start Today&apos;s Session
            </Link>
            <Link
              href="/chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.03] hover:bg-black/[0.08] dark:hover:bg-white/[0.06] border border-black/[0.1] dark:border-white/[0.08] text-theme-primary font-semibold text-sm transition-colors"
            >
              Ask AI Tutor
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Bento Grid: Hourly Density + Daily Goal + Mastery + Next 2h + Today Queue */}
      <section className="grid grid-cols-12 gap-4 auto-rows-min">
        {/* Card A — Hero: 24-Hour Study Density Bar Chart */}
        <BentoDensityChart className="col-span-12 lg:col-span-7 lg:row-span-2" />

        {/* Card B — Daily Goal Mega-Ring */}
        <div className="card col-span-12 sm:col-span-6 lg:col-span-5 lg:col-start-8 lg:row-start-1 p-5 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-3 px-0.5">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-violet-400" />
              Today's Goal
            </h3>
            <span className="text-[10px] font-mono text-violet-400 font-bold bg-violet-500/15 px-2 py-0.5 rounded-md border border-violet-500/25">
              {(165 / 210 * 100).toFixed(0)}%
            </span>
          </div>
          <DailyGoalRing size="sm" hideWrapperCard />
        </div>

        {/* Card C — Mastered Topics */}
        <div className="card col-span-12 sm:col-span-6 lg:col-span-5 lg:col-start-8 lg:row-start-2 p-5 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              Topics Mastered
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-mono">
              +2 today
            </span>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tight text-[var(--text-primary)] leading-none font-mono">
                  {MOCK_STUDY_STATS.topicsMastered}
                </span>
                <span className="text-base font-bold text-[var(--text-muted)] font-mono">
                  /{MOCK_STUDY_STATS.totalTopics}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 font-medium">
                {(MOCK_STUDY_STATS.topicsMastered / MOCK_STUDY_STATS.totalTopics * 100).toFixed(0)}% of curriculum
              </p>
            </div>
            <div className="ml-auto text-right space-y-1.5">
              <div className="flex items-center gap-2 justify-end text-[11px]">
                <span className="text-[var(--text-secondary)] font-medium">Quiz accuracy</span>
                <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 font-bold font-mono">
                  {MOCK_STUDY_STATS.quizAccuracyPercent}%
                </span>
              </div>
              <div className="flex items-center gap-2 justify-end text-[11px]">
                <span className="text-[var(--text-secondary)] font-medium">Cohort rank</span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/25 font-bold font-mono">
                  Top 5%
                </span>
              </div>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--input-bg)] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-700"
              style={{ width: `${MOCK_STUDY_STATS.topicsMastered / MOCK_STUDY_STATS.totalTopics * 100}%` }}
            />
          </div>
        </div>

        {/* Card D — Next 2 Hours (compact timeline) */}
        <BentoNextTwoHours className="col-span-12 lg:col-span-5 lg:col-start-8 lg:row-start-3" />

        {/* Card E — Today's Task Queue */}
        <div className="card col-span-12 lg:col-span-7 lg:row-span-1 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              Today&apos;s Task Queue
            </h3>
            <Link
              href="/planner"
              className="text-[10px] font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              All tasks
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1.5">
            {tasks.slice(0, 4).map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "w-full text-left px-2.5 py-2 rounded-xl border transition-all flex items-center gap-2.5",
                  task.completed
                    ? "bg-emerald-500/10 border-emerald-500/30 opacity-70"
                    : "bg-[var(--bg-elevated)]/60 hover:bg-[var(--bg-elevated)] border-[var(--border-card)]"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-4 h-4 rounded border shrink-0",
                    task.completed
                      ? "bg-emerald-500 border-emerald-400"
                      : "border-[var(--border-card)]"
                  )}
                >
                  {task.completed && <CheckCircle2 className="w-3 h-3 text-black" />}
                </span>
                <span
                  className="w-1 h-6 rounded-full shrink-0"
                  style={{ backgroundColor: task.subjectColor, opacity: 0.7 }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="px-1.5 py-px rounded text-[9px] font-bold"
                      style={{
                        backgroundColor: `${task.subjectColor}18`,
                        color: task.subjectColor,
                      }}
                    >
                      {task.subjectName}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">{task.dueText}</span>
                    {task.isHighPriority && (
                      <Zap className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-xs font-semibold mt-0.5 truncate",
                      task.completed ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]"
                    )}
                  >
                    {task.topicTitle}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-card)] text-[11px]">
            <span className="text-[var(--text-muted)]">
              {completedCount}/{tasks.length} done · {(completedCount / tasks.length * 100).toFixed(0)}%
            </span>
            <Link
              href="/planner"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold hover:from-violet-500 hover:to-indigo-500 transition-colors"
            >
              <Play className="w-2.5 h-2.5 fill-white" />
              Start Next
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Continue Studying + Today's Revision */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-400" />
              Continue Studying
            </h2>
            <Link
              href="/subjects"
              className="text-xs font-semibold text-violet-400 hover:text-violet-300"
            >
              All Subjects →
            </Link>
          </div>

          <div className="space-y-3">
            {continueSubjects.map((subject) => (
              <div
                key={subject.id}
                className="card-interactive relative overflow-hidden p-4 sm:p-5"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px]"
                  style={{ backgroundColor: subject.accentColor }}
                />

                <div className="flex items-start justify-between gap-3 pl-1">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold"
                        style={{
                          backgroundColor: `${subject.accentColor}20`,
                          color: subject.accentColor,
                          border: `1px solid ${subject.accentColor}40`,
                        }}
                      >
                        {subject.code}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                        {subject.name}
                      </h3>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">{subject.category}</p>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] font-mono shrink-0 font-semibold">
                    Unit {subject.completedUnits}/{subject.totalUnits} done
                  </span>
                </div>

                <div className="mt-3 w-full h-1.5 rounded-full bg-[var(--input-bg)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${subject.currentUnit?.progressPercentage ?? 0}%`,
                      backgroundColor: subject.accentColor,
                    }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-[var(--text-muted)] font-medium">
                    Last active: {subject.lastAccessed}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/chat?subject=${subject.id}`}
                      className="px-2.5 py-1.5 rounded-lg border border-[var(--border-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] text-xs font-medium"
                    >
                      Ask Doubt
                    </Link>
                    <Link
                      href={`/subjects/${subject.id}`}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#10a37f] to-teal-600 text-white text-xs font-semibold shadow-xs"
                    >
                      Resume Unit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              Today&apos;s Revision
            </h2>
            <span className="text-[11px] font-medium text-[var(--text-muted)]">
              {completedCount}/{tasks.length} Completed
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {tasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "w-full text-left p-3 rounded-xl border transition-all",
                  task.completed
                    ? "bg-emerald-500/10 border-emerald-500/30 opacity-70"
                    : "bg-[var(--bg-elevated)]/60 hover:bg-[var(--bg-elevated)] border-[var(--border-card)]"
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex items-center justify-center w-[18px] h-[18px] rounded border shrink-0",
                      task.completed
                        ? "bg-emerald-500 border-emerald-400"
                        : "border-[var(--border-card)]"
                    )}
                  >
                    {task.completed && <CheckCircle2 className="w-3 h-3 text-black" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono"
                        style={{
                          backgroundColor: `${task.subjectColor}20`,
                          color: task.subjectColor,
                        }}
                      >
                        {task.subjectName}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">{task.dueText}</span>
                    </div>
                    <p
                      className={cn(
                        "text-xs font-semibold mt-1 leading-snug",
                        task.completed ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]"
                      )}
                    >
                      {task.topicTitle}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <Link
            href="/planner"
            className="mt-4 pt-3 border-t border-[var(--border-card)] text-xs font-semibold text-violet-400 hover:text-violet-300"
          >
            View Full Planner →
          </Link>
        </section>
      </div>

      {/* 4. Exam Countdown */}
      <section className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-card)]">
            <Target className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            Semester 3 Midterms • Oct 18, 2026
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={urgentCountdown ? "badge-urgent" : "badge-streak"}>
            {countdown} Days Left
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
            89% mastery target achievable at current pace
          </span>
        </div>
      </section>

      {/* 5. Weekly Study Activity */}
      <section className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Weekly Study Activity</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {weekHours.toFixed(1)} hrs this week
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +14% vs last week
          </span>
        </div>

        <div className="flex items-end justify-between gap-2 h-44 px-1">
          {MOCK_WEEKLY_STUDY.map((day) => {
            const maxMinutes = 320;
            const heightPercent = Math.min(100, Math.round((day.minutes / maxMinutes) * 100));
            const hours = (day.minutes / 60).toFixed(1);
            const showTip = hoveredDay === day.day;

            return (
              <div
                key={day.day}
                className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer"
                onMouseEnter={() => setHoveredDay(day.day)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div
                  className={cn(
                    "text-[10px] font-medium px-2 py-1 rounded-md bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-card)] mb-2 transition-opacity shadow-md",
                    showTip ? "opacity-100" : "opacity-0"
                  )}
                >
                  {hours} hrs
                </div>
                <div className="w-full max-w-[40px] h-32 flex items-end">
                  <div
                    className={cn(
                      "w-full rounded-t-lg origin-bottom transition-[height] duration-700 ease-out",
                      day.isToday
                        ? "bg-gradient-to-t from-[#7C3AED] to-[#06B6D4] shadow-md"
                        : "bg-slate-500/30 hover:bg-violet-600/50"
                    )}
                    style={{ height: barsReady ? `${heightPercent}%` : "0%" }}
                  />
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs",
                    day.isToday ? "text-violet-400 font-bold" : "text-[var(--text-muted)]"
                  )}
                >
                  {day.day}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-[var(--border-card)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]" />
            Today
          </span>
          <span>Consistent Streak: 7 Days</span>
        </div>
      </section>

      {/* 6. Recent Course Documents */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[var(--text-primary)]">Recent Course Documents</h2>
          <Link
            href="/upload"
            className="text-xs font-semibold text-violet-400 hover:text-violet-300"
          >
            Upload New File →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MOCK_RECENT_DOCUMENTS.map((doc) => (
            <div key={doc.id} className="card p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-card)] shrink-0">
                  {getDocIcon(doc.fileType)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-[var(--text-primary)] truncate">{doc.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[var(--text-muted)]">
                    <span style={{ color: doc.subjectColor }}>{doc.subjectCode}</span>
                    <span>•</span>
                    <span>{doc.fileSize}</span>
                    <span>•</span>
                    <span>{doc.uploadDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {doc.aiSummaryReady && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    AI Ready
                  </span>
                )}
                <Link
                  href={`/chat?doc=${doc.id}`}
                  className="p-2 rounded-xl text-[var(--text-muted)] hover:text-cyan-400 hover:bg-[var(--bg-elevated)]"
                  aria-label="Ask AI about this document"
                >
                  <MessageSquare className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   BENTO SUBCOMPONENTS
   ────────────────────────────────────────────────────────── */

/* Sample 24-hour subject-split density (mimics what would come from backend) */
const DENSITY_24H: Array<{
  hour: number;
  segments: Array<{ minutes: number; color: string; subject: string }>;
}> = Array.from({ length: 24 }).map((_, hour) => {
  switch (hour) {
    case 8:
      return { hour, segments: [{ minutes: 25, color: "#7C3AED", subject: "DSA" }] };
    case 9:
      return {
        hour,
        segments: [
          { minutes: 30, color: "#10B981", subject: "Chem" },
          { minutes: 22, color: "#06B6D4", subject: "CN" },
        ],
      };
    case 10:
      return { hour, segments: [{ minutes: 7, color: "#06B6D4", subject: "CN" }] };
    case 11:
      return {
        hour,
        segments: [
          { minutes: 40, color: "#7C3AED", subject: "DSA" },
          { minutes: 20, color: "#F59E0B", subject: "DBMS" },
        ],
      };
    case 13:
      return { hour, segments: [{ minutes: 40, color: "#F59E0B", subject: "DBMS" }] };
    case 14:
      return {
        hour,
        segments: [
          { minutes: 20, color: "#10B981", subject: "Chem" },
          { minutes: 15, color: "#EC4899", subject: "Math" },
        ],
      };
    case 15:
      return {
        hour,
        segments: [
          { minutes: 30, color: "#7C3AED", subject: "DSA" },
          { minutes: 28, color: "#06B6D4", subject: "CN" },
        ],
      };
    case 16:
      return { hour, segments: [{ minutes: 18, color: "#EC4899", subject: "Math" }] };
    case 17:
      return { hour, segments: [{ minutes: 44, color: "#10B981", subject: "Chem" }] };
    case 19:
      return { hour, segments: [{ minutes: 30, color: "#F59E0B", subject: "DBMS" }] };
    case 20:
      return {
        hour,
        segments: [
          { minutes: 15, color: "#7C3AED", subject: "DSA" },
          { minutes: 5, color: "#10B981", subject: "Chem" },
        ],
      };
    default:
      return { hour, segments: [] };
  }
});

function BentoDensityChart({ className }: { className?: string }) {
  const totalMinutes = DENSITY_24H.reduce(
    (sum, h) => sum + h.segments.reduce((s, seg) => s + seg.minutes, 0),
    0
  );
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return (
    <div className={cn("card p-5 space-y-4", className)}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-violet-400" />
            Study Density Today
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Hour-by-hour subject-split · 00:00 → 23:59
          </p>
        </div>
        <div className="flex items-end gap-3">
          <div>
            <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Total logged
            </div>
            <div className="text-2xl font-black text-[var(--text-primary)] tracking-tight font-mono flex items-baseline gap-1">
              <span>{hours}h</span>
              <span className="text-sm font-semibold text-[var(--text-secondary)]">{String(mins).padStart(2, "0")}m</span>
            </div>
          </div>
          <span className="px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[10px] font-bold flex items-center gap-1">
            <Activity className="w-2.5 h-2.5" /> +14% vs yesterday
          </span>
        </div>
      </div>

      <div className="flex items-end gap-[3px] h-48 px-0.5 pt-4">
        {DENSITY_24H.map((h) => {
          const minStacked = h.segments.reduce((s, x) => s + x.minutes, 0);
          const totalPct = Math.min(100, (minStacked / 60) * 100);
          const now = new Date().getHours();
          const isNow = now === h.hour;
          const showTick = h.hour % 3 === 0;

          return (
            <div key={h.hour} className="flex-1 flex flex-col items-center justify-end h-full min-w-0 group relative">
              {/* Tooltip on hover */}
              {minStacked > 0 && (
                <div className="absolute -top-9 z-30 hidden group-hover:flex flex-col items-center pointer-events-none transition-all">
                  <span className="px-2 py-1 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-card)] text-[10px] font-mono font-bold text-[var(--text-primary)] shadow-lg whitespace-nowrap">
                    {String(h.hour).padStart(2, "0")}:00 · {minStacked}m
                  </span>
                  <span className="w-1.5 h-1.5 rotate-45 bg-[var(--bg-elevated)] -mt-1 border-r border-b border-[var(--border-card)]" />
                </div>
              )}

              <div
                className={cn(
                  "w-full flex flex-col justify-end rounded-t-lg overflow-hidden transition-all duration-700 ease-out origin-bottom",
                  totalPct === 0 ? "bg-[var(--input-bg)]/40" : "",
                  isNow && "ring-1 ring-amber-400 ring-offset-2 ring-offset-transparent z-10"
                )}
                style={{ height: `${Math.max(totalPct, totalPct > 0 ? 8 : 4)}%` }}
              >
                {h.segments.length > 0 ? (
                  h.segments.map((seg, i) => (
                    <div
                      key={`${h.hour}-${i}`}
                      className="w-full transition-all"
                      style={{
                        height: `${(seg.minutes / 60) * 100}%`,
                        backgroundColor: seg.color,
                        filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.25))",
                      }}
                    />
                  ))
                ) : (
                  <div className="w-full h-full bg-[var(--input-bg)]/50" />
                )}
              </div>
              {/* Hour label tick */}
              <span
                className={cn(
                  "mt-2 text-[10px] font-mono transition-colors font-semibold text-center leading-none",
                  isNow ? "text-amber-400 font-bold" : "text-[var(--text-secondary)]",
                  !showTick && "hidden group-hover:block group-hover:text-violet-400"
                )}
              >
                {String(h.hour).padStart(2, "0")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[var(--border-card)]">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Subjects</span>
        {[
          { color: "#7C3AED", label: "DSA" },
          { color: "#10B981", label: "Chemistry" },
          { color: "#06B6D4", label: "Networks" },
          { color: "#F59E0B", label: "DBMS" },
          { color: "#EC4899", label: "Mathematics" },
        ].map((l) => (
          <span
            key={l.color}
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[var(--text-secondary)]"
          >
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: l.color }}
            />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Card D: compact next-2h event timeline ── */
function parseStartMin(ts: string): number {
  const [h, m] = ts.split("-")[0].trim().split(":").map(Number);
  return h * 60 + m;
}

function BentoNextTwoHours({ className }: { className?: string }) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const horizonMin = nowMin + 120;

  const upcoming = useMemo(() => {
    return [...MOCK_CALENDAR_EVENTS]
      .map((ev) => ({ ev, start: parseStartMin(ev.timeSlot) }))
      .filter((x) => x.start >= nowMin && x.start <= horizonMin)
      .sort((a, b) => a.start - b.start)
      .slice(0, 3);
  }, []);

  return (
    <div className={cn("card p-5 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9B99B5] flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          Next 2 Hours
        </h3>
        <Link
          href="/planner"
          className="text-[10px] font-semibold text-violet-300 hover:text-violet-200 flex items-center gap-1"
        >
          Full timeline
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Zap className="w-8 h-8 text-[#5A5875] mb-2" />
          <p className="text-xs font-semibold text-[#9B99B5]">No sessions scheduled</p>
          <p className="text-[11px] text-[#5A5875] mt-1">Open Planner to plan your next block</p>
          <Link
            href="/planner"
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-[11px] font-bold text-white border border-white/[0.08]"
          >
            <Play className="w-2.5 h-2.5 fill-white" />
            Plan a session
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {upcoming.map(({ ev, start }, i) => {
            const minutesUntil = start - nowMin;
            return (
              <div
                key={ev.id}
                className="relative flex items-start gap-3 p-2.5 rounded-xl border border-white/[0.05] bg-white/[0.015] hover:bg-white/[0.03] transition-colors"
              >
                <div
                  className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
                  style={{ backgroundColor: ev.subjectColor }}
                />
                <div className="pl-2 flex flex-col items-center gap-1 shrink-0">
                  <span className="text-[10px] font-black font-mono text-white">
                    {String(Math.floor(start / 60)).padStart(2, "0")}:
                    {String(start % 60).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "text-[9px] font-semibold px-1.5 py-0.5 rounded-md",
                      i === 0
                        ? "bg-violet-500/15 text-violet-300 border border-violet-500/25"
                        : "bg-white/[0.04] text-[#9B99B5]"
                    )}
                  >
                    {i === 0
                      ? minutesUntil < 60
                        ? `${minutesUntil}m left`
                        : `${Math.floor(minutesUntil / 60)}h ${minutesUntil % 60}m`
                      : `+${Math.ceil(minutesUntil / 60)}h block`}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="px-1.5 py-px rounded text-[9px] font-bold"
                      style={{
                        backgroundColor: `${ev.subjectColor}18`,
                        color: ev.subjectColor,
                      }}
                    >
                      {ev.subjectName}
                    </span>
                    {ev.type === "quiz" && (
                      <span className="text-[9px] font-semibold px-1.5 py-px rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                        Quiz
                      </span>
                    )}
                    {ev.type === "lecture" && (
                      <span className="text-[9px] font-semibold px-1.5 py-px rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                        Lecture
                      </span>
                    )}
                    {ev.type === "revision" && (
                      <span className="text-[9px] font-semibold px-1.5 py-px rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/25">
                        Revision
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-[#F1F1F8] mt-0.5 truncate">
                    {ev.title}
                  </p>
                  {ev.roomOrPlatform && (
                    <p className="text-[10px] text-[#5A5875] truncate flex items-center gap-1 mt-0.5">
                      <BookOpen className="w-2.5 h-2.5" />
                      {ev.roomOrPlatform}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
