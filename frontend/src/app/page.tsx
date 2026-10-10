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
  HelpCircle,
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

  // Dynamic Weekly Study Data based on current day of week
  const weeklyStudyData = useMemo(() => {
    const currentDayIdx = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const daysOrder = [
      { key: "Mon", idx: 1, defaultMins: 180 },
      { key: "Tue", idx: 2, defaultMins: 220 },
      { key: "Wed", idx: 3, defaultMins: 275 },
      { key: "Thu", idx: 4, defaultMins: 250 },
      { key: "Fri", idx: 5, defaultMins: 240 },
      { key: "Sat", idx: 6, defaultMins: 310 },
      { key: "Sun", idx: 0, defaultMins: 160 },
    ];

    const adjustedCurrent = currentDayIdx === 0 ? 7 : currentDayIdx;

    return daysOrder.map((d) => {
      const adjustedDay = d.idx === 0 ? 7 : d.idx;
      const isToday = adjustedCurrent === adjustedDay;
      const isFuture = adjustedDay > adjustedCurrent;
      let minutes = 0;

      if (isToday) {
        minutes = 389; // Synced today's total logged minutes (6h 29m)
      } else if (!isFuture) {
        minutes = d.defaultMins; // Historical logged past day
      } else {
        minutes = 0; // Future day: 0 hours logged yet
      }

      return { day: d.key, minutes, isToday, isFuture };
    });
  }, []);

  const weekHours = useMemo(
    () => weeklyStudyData.reduce((sum, d) => sum + d.minutes, 0) / 60,
    [weeklyStudyData]
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
              {(389 / 420 * 100).toFixed(0)}%
            </span>
          </div>
          <DailyGoalRing size="sm" minutesLoggedOverride={389} minutesTargetOverride={420} hideWrapperCard />
        </div>

        {/* Card C — Mastered Topics */}
        <div className="card col-span-12 sm:col-span-6 lg:col-span-5 lg:col-start-8 lg:row-start-2 p-5 space-y-3 relative group">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              Topics Mastered
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-mono flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-emerald-400" /> +2 today
            </span>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tight text-[var(--text-primary)] leading-none font-mono">
                  {MOCK_STUDY_STATS.topicsMastered}
                </span>
                <span className="text-sm font-bold text-[var(--text-muted)] font-mono">
                  /{MOCK_STUDY_STATS.totalTopics}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium flex items-center gap-1.5">
                <span className="font-bold text-emerald-400">
                  {Math.round((MOCK_STUDY_STATS.topicsMastered / MOCK_STUDY_STATS.totalTopics) * 100)}%
                </span>
                <span>of curriculum complete</span>
              </p>
            </div>

            <div className="ml-auto text-right space-y-1.5">
              <div className="flex items-center gap-2 justify-end text-[11px]">
                <span className="text-[var(--text-secondary)] font-medium">Quiz accuracy</span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 font-bold font-mono">
                  {MOCK_STUDY_STATS.quizAccuracyPercent}%
                </span>
              </div>
              <div className="flex items-center gap-2 justify-end text-[11px]">
                <span className="text-[var(--text-secondary)] font-medium">Cohort rank</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/25 font-bold font-mono">
                  Top 5%
                </span>
              </div>
            </div>
          </div>

          {/* Glowing Animated Progress Bar */}
          <div className="space-y-1 pt-1">
            <div className="w-full h-2.5 rounded-full bg-[var(--input-bg)] overflow-hidden p-0.5 border border-white/5 relative">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                style={{ width: `${(MOCK_STUDY_STATS.topicsMastered / MOCK_STUDY_STATS.totalTopics) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-0.5 font-medium">
              <span>Breakdown: 12 DSA · 8 Chem · 5 CN · 3 DBMS</span>
              <span className="text-emerald-400 font-semibold">14 remaining</span>
            </div>
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

      {/* 3. Continue Studying (Full Width 2x2 Grid) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-400" />
            Continue Studying
          </h2>
          <Link
            href="/subjects"
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            All Subjects ({MOCK_SUBJECTS.length})
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {continueSubjects.map((subject) => (
            <div
              key={subject.id}
              className="card-interactive relative overflow-hidden p-4 sm:p-5 flex flex-col justify-between"
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px]"
                style={{ backgroundColor: subject.accentColor }}
              />

              <div className="space-y-3 pl-1">
                <div className="flex items-start justify-between gap-3">
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
                    Unit {subject.completedUnits}/{subject.totalUnits}
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-[var(--input-bg)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${subject.currentUnit?.progressPercentage ?? 0}%`,
                      backgroundColor: subject.accentColor,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border-card)] flex flex-wrap items-center justify-between gap-2 pl-1">
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

      {/* 5. Weekly Study Activity */}
      <section className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Weekly Study Activity
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {weekHours.toFixed(1)} hrs logged this week · Avg {(weekHours / 7).toFixed(1)}h / day
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +14% vs last week
          </span>
        </div>

        <div className="relative pt-6 pb-2">
          <div className="flex items-end justify-between gap-3 h-48 px-2 relative z-10">
            {/* Dynamic Average benchmark reference line */}
            <div
              className="absolute inset-x-2 border-b border-dashed border-emerald-400/40 pointer-events-none z-0 transition-all"
              style={{ bottom: `${(3.5 / 6.0) * 128 + 24}px` }}
            >
              <span className="absolute right-0 -top-2.5 text-[9px] font-mono font-bold text-emerald-300 bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-emerald-500/30 shadow-sm flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                Target: 3.5h/day
              </span>
            </div>

            {weeklyStudyData.map((day) => {
              const maxMinutes = 360; // 6.0 hours scale
              const heightPercent = Math.min(100, Math.round((day.minutes / maxMinutes) * 100));
              const hours = (day.minutes / 60).toFixed(1);
              const targetMet = day.minutes >= 210; // 3.5h = 210 mins

              return (
                <div
                  key={day.day}
                  className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group relative"
                  onMouseEnter={() => setHoveredDay(day.day)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* Hours Badge Above Bar */}
                  <div
                    className={cn(
                      "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-all mb-1.5 whitespace-nowrap shadow-sm flex items-center gap-1",
                      day.isToday
                        ? "bg-violet-500 text-white shadow-violet-500/30 ring-1 ring-violet-300"
                        : day.isFuture
                        ? "bg-white/[0.02] text-[var(--text-muted)] border border-white/5"
                        : targetMet
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 group-hover:bg-emerald-500 group-hover:text-black"
                        : "bg-[var(--input-bg)] text-[var(--text-secondary)] border border-[var(--border-card)] group-hover:text-white group-hover:bg-violet-500/20"
                    )}
                  >
                    {day.isFuture ? "0.0h" : `${hours}h`}
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[42px] h-32 flex items-end">
                    <div
                      className={cn(
                        "w-full rounded-t-lg origin-bottom transition-all duration-700 ease-out",
                        day.isToday
                          ? "bg-gradient-to-t from-[#7C3AED] via-[#06B6D4] to-[#10B981] shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-y-[1.02]"
                          : day.isFuture
                          ? "bg-white/[0.02] border-t border-dashed border-white/10"
                          : targetMet
                          ? "bg-gradient-to-t from-violet-900/60 via-teal-600/50 to-emerald-400/80 border-t border-emerald-400/40 group-hover:from-violet-600 group-hover:to-emerald-300 group-hover:scale-y-[1.02]"
                          : "bg-gradient-to-t from-white/[0.04] to-white/[0.12] border-t border-white/10 group-hover:from-violet-600/30 group-hover:to-cyan-400/40 group-hover:scale-y-[1.02]"
                      )}
                      style={{ height: barsReady ? (day.isFuture ? "4%" : `${heightPercent}%`) : "0%" }}
                    />
                  </div>

                  {/* Day label */}
                  <span
                    className={cn(
                      "mt-2 text-xs font-mono font-semibold transition-colors flex items-center gap-0.5",
                      day.isToday
                        ? "text-cyan-300 font-bold"
                        : day.isFuture
                        ? "text-[var(--text-muted)]"
                        : targetMet
                        ? "text-emerald-400 font-medium"
                        : "text-[var(--text-secondary)] group-hover:text-white"
                    )}
                  >
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
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
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const totalMinutes = DENSITY_24H.reduce(
    (sum, h) => sum + h.segments.reduce((s, seg) => s + seg.minutes, 0),
    0
  );
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  // Compute Peak Focus Hour and Top Subject
  const peakHourObj = useMemo(() => {
    let maxMin = 0;
    let peak = DENSITY_24H[0];
    DENSITY_24H.forEach((h) => {
      const hMin = h.segments.reduce((s, seg) => s + seg.minutes, 0);
      if (hMin > maxMin) {
        maxMin = hMin;
        peak = h;
      }
    });
    return { hour: peak.hour, minutes: maxMin, segments: peak.segments };
  }, []);

  const topSubjectObj = useMemo(() => {
    const map: Record<string, { minutes: number; color: string }> = {};
    DENSITY_24H.forEach((h) => {
      h.segments.forEach((seg) => {
        if (!map[seg.subject]) {
          map[seg.subject] = { minutes: 0, color: seg.color };
        }
        map[seg.subject].minutes += seg.minutes;
      });
    });
    let topName = "";
    let maxM = 0;
    let color = "#7C3AED";
    Object.entries(map).forEach(([subj, data]) => {
      if (data.minutes > maxM) {
        maxM = data.minutes;
        topName = subj;
        color = data.color;
      }
    });
    return { name: topName, minutes: maxM, color };
  }, []);

  const currentHour = new Date().getHours();

  return (
    <div className={cn("card p-5 space-y-4 relative overflow-hidden", className)}>
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-violet-400" />
              Study Density Today
            </h3>
            {/* How to read info toggle button */}
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 flex items-center gap-1 transition-all cursor-pointer"
              title="How to read this graph?"
            >
              <HelpCircle className="w-3 h-3" />
              <span>How to read</span>
            </button>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            24-Hour Timeline · Bar height = study time per hour (0–60 mins)
          </p>
        </div>
        <div className="flex items-end gap-3">
          <div>
            <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider text-right">
              Total logged
            </div>
            <div className="text-2xl font-black text-[var(--text-primary)] tracking-tight font-mono flex items-baseline gap-1 justify-end">
              <span>{hours}h</span>
              <span className="text-sm font-semibold text-[var(--text-secondary)]">{String(mins).padStart(2, "0")}m</span>
            </div>
          </div>
          <span className="px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[10px] font-bold flex items-center gap-1">
            <Activity className="w-2.5 h-2.5" /> +14% vs yesterday
          </span>
        </div>
      </div>

      {/* Expandable "How to read" Guide Card */}
      {showGuide && (
        <div className="p-3.5 rounded-xl bg-violet-950/40 border border-violet-500/30 text-xs text-violet-200 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between font-bold text-violet-100">
            <span className="flex items-center gap-1.5">
              💡 Quick Guide: How to Read Your Study Density
            </span>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="text-violet-400 hover:text-violet-200 text-xs font-bold"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1 border-t border-violet-500/20">
            <div className="bg-black/20 p-2 rounded-lg border border-white/5">
              <span className="font-bold text-amber-300 block mb-0.5">1. Height = Duration</span>
              Higher bar means more focus time in that 1-hour block (up to 60 mins max).
            </div>
            <div className="bg-black/20 p-2 rounded-lg border border-white/5">
              <span className="font-bold text-cyan-300 block mb-0.5">2. Colors = Subjects</span>
              Stacked colors show which subjects you studied during that specific hour.
            </div>
            <div className="bg-black/20 p-2 rounded-lg border border-white/5">
              <span className="font-bold text-emerald-300 block mb-0.5">3. Hover for Details</span>
              Hover any bar to see exact minutes per subject & click legends to filter.
            </div>
          </div>
        </div>
      )}

      {/* Insights summary pill */}
      <div className="flex items-center justify-between gap-2 text-[11px] px-3 py-1.5 rounded-lg bg-[var(--input-bg)]/60 border border-[var(--border-card)] text-[var(--text-secondary)] flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
            <Zap className="w-3 h-3 text-amber-400" /> Peak: {String(peakHourObj.hour).padStart(2, "0")}:00 ({peakHourObj.minutes}m)
          </span>
          <span className="text-[var(--text-muted)]">•</span>
          <span className="inline-flex items-center gap-1 font-semibold text-violet-300">
            🎯 Top Focus: {topSubjectObj.name} ({Math.floor(topSubjectObj.minutes / 60)}h {topSubjectObj.minutes % 60}m)
          </span>
        </div>
        <span className="text-[10px] text-[var(--text-muted)] italic hidden sm:inline">
          Hover any bar for minute breakdown
        </span>
      </div>

      {/* Chart Container with Y-Axis */}
      <div className="relative pt-6 pb-1">
        {/* Y-Axis Label Heading */}
        <span className="absolute left-0 top-0 text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Mins / Hr
        </span>

        {/* Y-Axis Grid Lines & Labels */}
        <div className="absolute inset-x-0 top-6 bottom-7 pointer-events-none flex flex-col justify-between pl-8">
          <div className="w-full border-b border-dashed border-[var(--border-card)]/50 relative">
            <span className="absolute -left-8 -top-2 text-[9px] font-mono font-bold text-[var(--text-muted)]">60m</span>
          </div>
          <div className="w-full border-b border-dashed border-[var(--border-card)]/30 relative">
            <span className="absolute -left-8 -top-2 text-[9px] font-mono text-[var(--text-muted)]">30m</span>
          </div>
          <div className="w-full border-b border-[var(--border-card)] relative">
            <span className="absolute -left-8 -top-2 text-[9px] font-mono text-[var(--text-muted)]">0m</span>
          </div>
        </div>

        {/* 24-Hour Bars Grid */}
        <div className="flex items-end gap-[3px] h-48 pl-8 pr-0.5 relative z-10">
          {DENSITY_24H.map((h) => {
            const minStacked = h.segments.reduce((s, x) => s + x.minutes, 0);
            const totalPct = Math.min(100, (minStacked / 60) * 100);
            const isNow = currentHour === h.hour;
            const showTick = h.hour % 3 === 0;

            return (
              <div
                key={h.hour}
                className="flex-1 flex flex-col items-center justify-end h-full min-w-0 group relative cursor-pointer"
              >
                {/* Live hour pulse badge above bar */}
                {isNow && (
                  <div className="absolute -top-6 z-20 flex flex-col items-center pointer-events-none">
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[8px] font-bold font-mono text-amber-300 flex items-center gap-1 shadow-sm">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                      </span>
                      NOW
                    </span>
                  </div>
                )}

                {/* Rich Tooltip on hover */}
                <div className="absolute -top-24 z-40 hidden group-hover:flex flex-col items-center pointer-events-none transition-all duration-200">
                  <div className="p-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-card)] text-[11px] text-[var(--text-primary)] shadow-2xl backdrop-blur-md min-w-[130px] space-y-1">
                    <div className="font-mono font-bold text-[10px] text-[var(--text-muted)] border-b border-[var(--border-card)] pb-1 flex justify-between items-center gap-2">
                      <span>{String(h.hour).padStart(2, "0")}:00 – {String((h.hour + 1) % 24).padStart(2, "0")}:00</span>
                      <span className="text-violet-300 font-bold">{minStacked}m</span>
                    </div>
                    {h.segments.length > 0 ? (
                      h.segments.map((seg, i) => (
                        <div key={i} className="flex items-center justify-between gap-2 text-[10px] font-medium">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                            {seg.subject}
                          </span>
                          <span className="font-mono font-bold">{seg.minutes}m</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[10px] text-[var(--text-muted)] italic">No study logged</div>
                    )}
                  </div>
                  <span className="w-2 h-2 rotate-45 bg-[var(--bg-elevated)] -mt-1 border-r border-b border-[var(--border-card)]" />
                </div>

                {/* Stacked Bar Container */}
                <div
                  className={cn(
                    "w-full flex flex-col justify-end rounded-t-sm overflow-hidden transition-all duration-300 ease-out origin-bottom group-hover:ring-1 group-hover:ring-violet-400/60",
                    totalPct === 0 ? "bg-white/[0.03]" : "",
                    isNow && totalPct > 0 && "ring-1 ring-amber-400 ring-offset-1 ring-offset-transparent shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                  )}
                  style={{ height: `${Math.max(totalPct, totalPct > 0 ? 8 : 4)}%` }}
                >
                  {h.segments.length > 0 ? (
                    h.segments.map((seg, i) => {
                      const isHighlighted = !hoveredSubject || hoveredSubject === seg.subject;
                      return (
                        <div
                          key={`${h.hour}-${i}`}
                          className="w-full transition-all duration-200"
                          style={{
                            height: `${(seg.minutes / (minStacked || 1)) * 100}%`,
                            backgroundColor: seg.color,
                            opacity: isHighlighted ? 1 : 0.25,
                            filter: isHighlighted ? "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" : "none",
                          }}
                        />
                      );
                    })
                  ) : (
                    <div className={cn("w-full h-full", isNow ? "bg-amber-400/10 border-t border-amber-400/40" : "bg-white/[0.02]")} />
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
      </div>

      {/* Legend with Hover Interactivity */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-card)]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Subjects:</span>
          {[
            { color: "#7C3AED", label: "DSA", fullName: "DSA" },
            { color: "#10B981", label: "Chemistry", fullName: "Chem" },
            { color: "#06B6D4", label: "Networks", fullName: "CN" },
            { color: "#F59E0B", label: "DBMS", fullName: "DBMS" },
            { color: "#EC4899", label: "Mathematics", fullName: "Math" },
          ].map((l) => (
            <button
              key={l.color}
              type="button"
              onMouseEnter={() => setHoveredSubject(l.fullName)}
              onMouseLeave={() => setHoveredSubject(null)}
              className={cn(
                "inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded transition-all cursor-pointer",
                hoveredSubject === l.fullName
                  ? "bg-white/10 text-white shadow-sm scale-105"
                  : "text-[var(--text-secondary)] hover:text-white"
              )}
            >
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0 transition-transform"
                style={{ backgroundColor: l.color }}
              />
              {l.label}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-[var(--text-muted)] font-mono">
          24h Timeline (00:00 – 23:59)
        </span>
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
