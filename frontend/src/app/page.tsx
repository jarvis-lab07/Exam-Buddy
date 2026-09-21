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
      <section className="relative overflow-hidden card p-6 sm:p-8 bg-gradient-to-br from-violet-900/25 via-indigo-900/15 to-transparent">
        <div className="absolute -top-16 -right-10 w-72 h-72 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-violet-300" />
              <span>Smart Revision Assistant</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F1F1F8]">
              Welcome back, {MOCK_USER.name}! 👋
            </h1>

            <p className="text-[#9B99B5] text-sm sm:text-base leading-relaxed">
              You have <strong className="text-[#F1F1F8] font-semibold">3 exam topics</strong> scheduled
              for spaced revision today. Keep your{" "}
              <strong className="text-amber-300 font-semibold">7-Day streak</strong> going!
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#9B99B5]">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-violet-400" />
                Sem 3 Midterms: Oct 18, 2026
              </span>
              <span className="hidden sm:inline text-[#5A5875]">|</span>
              <span className="flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-cyan-400" />
                AI Mastery Prediction: 89% Target
              </span>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <Link
              href="/planner"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-500/25 transition-all duration-200"
            >
              Start Today&apos;s Session
            </Link>
            <Link
              href="/chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-transparent hover:bg-white/[0.06] border border-white/[0.12] text-[#F1F1F8] font-medium text-sm transition-all duration-200"
            >
              Ask AI Tutor
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Stat chips */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_QUICK_METRICS.map((metric) => (
          <div key={metric.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5A5875]">
                  {metric.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-[#F1F1F8] tracking-tight">
                  {metric.value}
                </p>
                <p className="mt-1.5 text-xs text-[#9B99B5]">
                  {metricTrend(metric.id, metric.trendText)}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-[#1A1A2E] border border-white/[0.06]">
                {getMetricIcon(metric.id)}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 3. Continue Studying + Today's Revision */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#F1F1F8] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-400" />
              Continue Studying
            </h2>
            <Link
              href="/subjects"
              className="text-xs font-semibold text-violet-300 hover:text-violet-200"
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
                      <h3 className="text-sm sm:text-base font-bold text-[#F1F1F8]">
                        {subject.name}
                      </h3>
                    </div>
                    <p className="text-xs text-[#9B99B5]">{subject.category}</p>
                  </div>
                  <span className="text-xs text-[#9B99B5] font-mono shrink-0">
                    Unit {subject.completedUnits}/{subject.totalUnits} done
                  </span>
                </div>

                <div className="mt-3 w-full h-1.5 rounded-full bg-[#1A1A2E] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${subject.currentUnit?.progressPercentage ?? 0}%`,
                      backgroundColor: subject.accentColor,
                    }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-[#5A5875]">
                    Last active: {subject.lastAccessed}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/chat?subject=${subject.id}`}
                      className="px-2.5 py-1.5 rounded-lg border border-white/[0.1] text-[#9B99B5] hover:text-white hover:bg-white/[0.05] text-xs font-medium"
                    >
                      Ask Doubt
                    </Link>
                    <Link
                      href={`/subjects/${subject.id}`}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#7C3AED]/80 to-[#6366F1]/80 text-white text-xs font-semibold"
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
            <h2 className="text-base font-bold text-[#F1F1F8] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              Today&apos;s Revision
            </h2>
            <span className="text-[11px] font-medium text-[#9B99B5]">
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
                    ? "bg-emerald-950/30 border-emerald-500/20 opacity-50"
                    : "bg-[#1A1A2E]/60 hover:bg-[#1A1A2E] border-white/[0.06]"
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex items-center justify-center w-4.5 h-4.5 w-[18px] h-[18px] rounded border",
                      task.completed
                        ? "bg-emerald-500 border-emerald-400"
                        : "border-[#5A5875]"
                    )}
                  >
                    {task.completed && <CheckCircle2 className="w-3 h-3 text-black" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                        style={{
                          backgroundColor: `${task.subjectColor}20`,
                          color: task.subjectColor,
                        }}
                      >
                        {task.subjectName}
                      </span>
                      <span className="text-[11px] text-[#5A5875]">{task.dueText}</span>
                    </div>
                    <p
                      className={cn(
                        "text-xs font-medium mt-1 leading-snug",
                        task.completed ? "line-through text-[#9B99B5]" : "text-[#F1F1F8]"
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
            className="mt-4 pt-3 border-t border-white/[0.06] text-xs font-semibold text-violet-300 hover:text-violet-200"
          >
            View Full Planner →
          </Link>
        </section>
      </div>

      {/* 4. Exam Countdown */}
      <section className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-[#1A1A2E] border border-white/[0.06]">
            <Target className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-sm font-semibold text-[#F1F1F8]">
            Semester 3 Midterms • Oct 18, 2026
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={urgentCountdown ? "badge-urgent" : "badge-streak"}>
            {countdown} Days Left
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-[#9B99B5]">
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
            89% mastery target achievable at current pace
          </span>
        </div>
      </section>

      {/* 5. Weekly Study Activity */}
      <section className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-[#F1F1F8]">Weekly Study Activity</h2>
            <p className="text-xs text-[#9B99B5] mt-0.5">
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
                    "text-[10px] font-medium px-2 py-1 rounded-md bg-[#1A1A2E] text-white border border-white/10 mb-2 transition-opacity",
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
                        ? "bg-gradient-to-t from-[#7C3AED] to-[#06B6D4] shadow-md shadow-violet-500/30"
                        : "bg-slate-700 hover:bg-violet-600/50"
                    )}
                    style={{ height: barsReady ? `${heightPercent}%` : "0%" }}
                  />
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs",
                    day.isToday ? "text-violet-300 font-bold" : "text-[#9B99B5]"
                  )}
                >
                  {day.day}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#9B99B5]">
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
          <h2 className="text-base font-bold text-[#F1F1F8]">Recent Course Documents</h2>
          <Link
            href="/upload"
            className="text-xs font-semibold text-violet-300 hover:text-violet-200"
          >
            Upload New File →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MOCK_RECENT_DOCUMENTS.map((doc) => (
            <div key={doc.id} className="card p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-[#1A1A2E] border border-white/[0.06] shrink-0">
                  {getDocIcon(doc.fileType)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-[#F1F1F8] truncate">{doc.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#9B99B5]">
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
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    AI Ready
                  </span>
                )}
                <Link
                  href={`/chat?doc=${doc.id}`}
                  className="p-2 rounded-xl text-[#9B99B5] hover:text-cyan-300 hover:bg-white/[0.06]"
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
