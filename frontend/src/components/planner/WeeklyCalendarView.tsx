"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  MapPin,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";
import { CalendarEvent } from "@/types";

interface WeeklyCalendarViewProps {
  events: CalendarEvent[];
}

const DAYS: { key: CalendarEvent["dayOfWeek"]; label: string; full: string }[] = [
  { key: "Mon", label: "Mon", full: "Monday" },
  { key: "Tue", label: "Tue", full: "Tuesday" },
  { key: "Wed", label: "Wed", full: "Wednesday" },
  { key: "Thu", label: "Thu", full: "Thursday" },
  { key: "Fri", label: "Fri", full: "Friday" },
  { key: "Sat", label: "Sat", full: "Saturday" },
  { key: "Sun", label: "Sun (Today)", full: "Sunday" },
];

export function WeeklyCalendarView({ events }: WeeklyCalendarViewProps) {
  const [selectedDay, setSelectedDay] = useState<CalendarEvent["dayOfWeek"]>("Sun");
  const [completedEventIds, setCompletedEventIds] = useState<string[]>([]);

  const toggleEventComplete = (id: string) => {
    setCompletedEventIds((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const dayEvents = events.filter((e) => e.dayOfWeek === selectedDay);

  const getTypeBadge = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "lecture":
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">Lecture</span>;
      case "revision":
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/25">Revision</span>;
      case "quiz":
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">Speed Quiz</span>;
      case "flashcards":
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/25">Flashcards</span>;
      case "exam":
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/25">Mock Exam</span>;
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/[0.08] space-y-5">
      {/* Day Selector Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-bold text-white">Weekly Study Schedule</h3>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {DAYS.map((d) => {
            const isSelected = selectedDay === d.key;
            const count = events.filter((e) => e.dayOfWeek === d.key).length;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => setSelectedDay(d.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? "bg-violet-600 text-white border border-violet-500/40"
                    : "bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.05]"
                }`}
              >
                <span>{d.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : "bg-white/[0.06] text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Events for Selected Day */}
      {dayEvents.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          No scheduled sessions for this day. Enjoy your rest or log an impromptu review!
        </div>
      ) : (
        <div className="space-y-3">
          {dayEvents.map((event) => {
            const isDone = completedEventIds.includes(event.id);
            return (
              <div
                key={event.id}
                onClick={() => toggleEventComplete(event.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDone
                    ? "bg-white/[0.01] border-white/[0.04] opacity-50"
                    : "glass-card border-white/[0.08] hover:border-violet-500/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleEventComplete(event.id);
                    }}
                    className={`p-1.5 rounded-xl border mt-0.5 transition-colors ${
                      isDone
                        ? "bg-emerald-500 border-emerald-400 text-white"
                        : "bg-white/[0.03] border-white/[0.1] text-transparent hover:border-violet-400"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold"
                        style={{
                          backgroundColor: `${event.subjectColor}20`,
                          color: event.subjectColor,
                        }}
                      >
                        {event.subjectName}
                      </span>
                      {getTypeBadge(event.type)}
                      {event.unitTitle && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          {event.unitTitle}
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-sm font-bold text-white ${
                        isDone ? "line-through text-slate-400" : ""
                      }`}
                    >
                      {event.title}
                    </h4>

                    {event.roomOrPlatform && (
                      <p className="text-[11px] text-[#9B99B5] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {event.roomOrPlatform}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 font-mono text-[11px] bg-white/[0.04] px-2.5 py-1 rounded-xl border border-white/[0.06]">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {event.timeSlot} ({event.durationMinutes}m)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
