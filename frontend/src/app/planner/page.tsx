"use client";

import React from "react";
import { CalendarDays, CheckCircle2, Clock } from "lucide-react";
import { MOCK_TODAY_TASKS } from "@/lib/mock-data";

export default function PlannerPage() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-3xl border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Study Planner & Spaced Repetition</h1>
            <p className="text-sm text-slate-400">
              SM-2 spaced revision queue calibrated for your midterm dates
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-4">
        <h2 className="text-base font-bold text-white">Scheduled for Today</h2>
        <div className="space-y-3">
          {MOCK_TODAY_TASKS.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{
                    backgroundColor: `${task.subjectColor}20`,
                    color: task.subjectColor,
                  }}
                >
                  {task.subjectName}
                </span>
                <span className="text-sm text-slate-200">{task.topicTitle}</span>
              </div>
              <span className="text-xs text-slate-400">{task.dueText}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
