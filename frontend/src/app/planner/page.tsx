"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  Flame,
  AlertCircle,
  Timer,
  BookOpen,
  Calendar,
  Check,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { WeeklyCalendarView } from "@/components/planner/WeeklyCalendarView";
import { HourlyTimeline } from "@/components/planner/HourlyTimeline";
import { AddTaskModal } from "@/components/planner/AddTaskModal";
import {
  MOCK_TODAY_TASKS,
  MOCK_CALENDAR_EVENTS,
  MOCK_USER,
  MOCK_SUBJECTS,
} from "@/lib/mock-data";
import { StudyTask, CalendarEvent } from "@/types";

export default function PlannerPage() {
  const [tasks, setTasks] = useState<StudyTask[]>(MOCK_TODAY_TASKS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(MOCK_CALENDAR_EVENTS);
  const [viewMode, setViewMode] = useState<"hourly" | "queue" | "weekly">("hourly");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dailyMinutesLogged, setDailyMinutesLogged] = useState(165); // 2h 45m
  const dailyTargetMinutes = 210; // 3.5 hours

  // Load from localStorage if available
  useEffect(() => {
    try {
      let baseTasks: StudyTask[] = MOCK_TODAY_TASKS;
      const storedTasks = localStorage.getItem("exam_buddy_tasks");
      if (storedTasks) {
        baseTasks = JSON.parse(storedTasks);
      }

      // Check for Synced Cohort Exams
      const storedCohortExams = localStorage.getItem("exambuddy_planner_tasks");
      if (storedCohortExams) {
        const cohortExams = JSON.parse(storedCohortExams);
        const mappedCohortTasks: StudyTask[] = cohortExams.map((item: any) => ({
          id: item.id || `cohort-${Date.now()}`,
          subjectId: item.subjectCode || "COHORT",
          title: item.title || `📖 EXAM: ${item.subjectCode}`,
          estimatedMinutes: 120,
          completed: false,
          priority: "high" as const,
          type: "exam" as const,
          scheduledTime: item.date ? new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Morning",
        }));

        // Avoid duplicates by ID
        const existingIds = new Set(baseTasks.map((t) => t.id));
        const newUnique = mappedCohortTasks.filter((t) => !existingIds.has(t.id));
        baseTasks = [...newUnique, ...baseTasks];
      }

      setTasks(baseTasks);

      const storedMinutes = localStorage.getItem("exam_buddy_daily_minutes");
      if (storedMinutes) setDailyMinutesLogged(Number(storedMinutes));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleToggleTask = (id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      try {
        localStorage.setItem("exam_buddy_tasks", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleAddTask = (newTask: StudyTask) => {
    setTasks((prev) => {
      const updated = [newTask, ...prev];
      try {
        localStorage.setItem("exam_buddy_tasks", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleLogTime = (minutesToAdd: number) => {
    setDailyMinutesLogged((prev) => {
      const updated = prev + minutesToAdd;
      try {
        localStorage.setItem("exam_buddy_daily_minutes", String(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.min(
    100,
    Math.round((dailyMinutesLogged / dailyTargetMinutes) * 100)
  );

  const countdownDays = (() => {
    const parsed = new Date("Oct 18, 2026 00:00:00");
    if (Number.isNaN(parsed.getTime())) return 11;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.max(0, Math.round((parsed.getTime() - today.getTime()) / 86_400_000));
  })();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="glass-card p-6 sm:p-7 rounded-2xl border border-[var(--border-card)] border-t-2 border-amber-500/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              Study Planner & Spaced Repetition
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                SM-2 Calibrated
              </span>
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Daily review queue and midterm exam timeline tailored to your university schedule.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Session</span>
        </button>
      </div>

      {/* Midterm Exam Countdown Banner */}
      <div className="glass-card p-5 rounded-2xl border border-rose-500/30 border-t-2 border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Exam Countdown
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300">
                Midterms in {countdownDays} Days
              </span>
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
              Semester 3 Midterm Examinations begin on <span className="text-amber-500 dark:text-amber-300 font-bold">Oct 18, 2026</span>
            </p>
          </div>
        </div>

        {/* Exam subject badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {MOCK_SUBJECTS.slice(0, 3).map((s) => (
            <span
              key={s.id}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-[var(--input-bg)] border border-[var(--border-card)] text-[var(--text-secondary)] flex items-center gap-1"
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: s.color }}
              />
              {s.code}: {s.examDate}
            </span>
          ))}
        </div>
      </div>

      {/* Daily Study Goal & Streak Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Daily Goal Card */}
        <div className="glass-card p-5 rounded-2xl border border-[var(--border-card)] sm:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-cyan-400" />
              Daily Study Target (3.5 Hours)
            </span>
            <span className="text-cyan-400 dark:text-cyan-300 font-mono font-bold">
              {Math.floor(dailyMinutesLogged / 60)}h {dailyMinutesLogged % 60}m / 3h 30m ({progressPercent}%)
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-[var(--input-bg)] overflow-hidden border border-[var(--border-subtle)]">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[var(--border-subtle)]">
            <span className="text-[var(--text-muted)]">
              {completedCount} of {tasks.length} tasks completed today
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--text-muted)]">Quick Log:</span>
              <button
                type="button"
                onClick={() => handleLogTime(30)}
                className="px-2 py-0.5 rounded-md bg-[var(--input-bg)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-card)] transition-colors"
              >
                +30m
              </button>
              <button
                type="button"
                onClick={() => handleLogTime(60)}
                className="px-2 py-0.5 rounded-md bg-[var(--input-bg)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-card)] transition-colors"
              >
                +1h
              </button>
            </div>
          </div>
        </div>

        {/* Streak & Consistency Card */}
        <div className="glass-card p-5 rounded-2xl border border-[var(--border-card)] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)] font-medium">Study Streak</span>
            <span className="p-1.5 rounded-xl bg-amber-500/15 text-amber-500 dark:text-amber-400">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-2">
              {MOCK_USER.streakDays} Days
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/15">
                🔥 Active
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              Personal record: {MOCK_USER.longestStreakDays} days • Keep momentum!
            </p>
          </div>
        </div>
      </div>

      {/* View Switcher: Hourly Timeline | Today's Queue | Weekly Schedule */}
      <div className="flex items-center justify-between border-b border-[var(--border-card)] pb-2 flex-wrap gap-3">
        <div className="flex items-center gap-1 p-1 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-card)]">
          <button
            type="button"
            onClick={() => setViewMode("hourly")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === "hourly"
                ? "bg-violet-600 text-white shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Hourly
          </button>
          <button
            type="button"
            onClick={() => setViewMode("queue")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === "queue"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Queue ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setViewMode("weekly")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === "weekly"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Weekly
          </button>
        </div>

        <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
          {viewMode === "hourly"
            ? "Time-axis — see your study day, hour by hour"
            : viewMode === "queue"
            ? "Click a task to toggle completion"
            : "7-Day Timetable"}
        </span>
      </div>

      {/* Main Content Area */}
      {viewMode === "hourly" ? (
        <HourlyTimeline events={calendarEvents} />
      ) : viewMode === "queue" ? (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleToggleTask(task.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                task.completed
                  ? "bg-[var(--bg-elevated)]/40 border-[var(--border-card)] opacity-60"
                  : "glass-card border-[var(--border-card)] hover:border-amber-500/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleTask(task.id);
                  }}
                  className={`p-1.5 rounded-xl border mt-0.5 transition-colors ${
                    task.completed
                      ? "bg-emerald-500 border-emerald-400 text-white"
                      : "bg-[var(--input-bg)] border-[var(--border-card)] text-transparent hover:border-amber-400"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        backgroundColor: `${task.subjectColor}20`,
                        color: task.subjectColor,
                      }}
                    >
                      {task.subjectName}
                    </span>

                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)] uppercase tracking-wider border border-[var(--border-card)]">
                      {task.type}
                    </span>

                    {task.isHighPriority && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/25 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-500 dark:text-rose-400" />
                        Midterm High-Yield
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-sm font-semibold ${
                      task.completed ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]"
                    }`}
                  >
                    {task.topicTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center text-xs text-[var(--text-muted)]">
                <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>{task.dueText}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <WeeklyCalendarView events={calendarEvents} />
      )}

      {/* Task Creation Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onTaskAdded={handleAddTask}
      />
    </div>
  );
}
