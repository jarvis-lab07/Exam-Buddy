"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Clock,
  BookOpen,
  MapPin,
  CheckCircle2,
  Sparkles,
  BrainCircuit,
  Zap,
  Play,
  ChevronRight,
} from "lucide-react";
import { CalendarEvent } from "@/types";
import { cn } from "@/lib/utils";

interface HourlyTimelineProps {
  events: CalendarEvent[];
  startHour?: number;
  endHour?: number;
  onStartEvent?: (event: CalendarEvent) => void;
}

const ROW_HEIGHT = 84;
const TIME_GUTTER = 64;

function parseTimeSlot(timeSlot: string): { startMin: number; endMin: number } {
  const [startRaw, endRaw] = timeSlot.split("-").map((s) => s.trim());
  const [sh, sm] = startRaw.split(":").map(Number);
  const [eh, em] = endRaw.split(":").map(Number);
  return { startMin: sh * 60 + sm, endMin: eh * 60 + em };
}

function minToHourLabel(totalMin: number) {
  const h = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getTypeBadge(type: CalendarEvent["type"]) {
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
}

const STATS_PER_EVENT: Record<string, { pomodoros: number; flashcards: number; accuracy: number }> = {
  "ev-1": { pomodoros: 2, flashcards: 18, accuracy: 86 },
  "ev-2": { pomodoros: 3, flashcards: 0, accuracy: 91 },
  "ev-3": { pomodoros: 4, flashcards: 45, accuracy: 78 },
  "ev-4": { pomodoros: 1, flashcards: 12, accuracy: 82 },
  "ev-5": { pomodoros: 3, flashcards: 28, accuracy: 95 },
};

export function HourlyTimeline({
  events,
  startHour = 6,
  endHour = 26,
  onStartEvent,
}: HourlyTimelineProps) {
  const totalRows = endHour - startHour;
  const [now, setNow] = useState<Date>(new Date());
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowWithinRange =
    nowMin >= startHour * 60 && nowMin <= endHour * 60 + 60;

  const eventsWithPositions = useMemo(() => {
    return events
      .map((ev) => {
        const { startMin, endMin } = parseTimeSlot(ev.timeSlot);
        const startPx = ((startMin - startHour * 60) / 60) * ROW_HEIGHT;
        const heightPx = ((endMin - startMin) / 60) * ROW_HEIGHT - 4;
        return { ev, startPx: Math.max(0, startPx), heightPx, startMin, endMin };
      })
      .filter(({ startPx }) => startPx >= -ROW_HEIGHT)
      .sort((a, b) => a.startMin - b.startMin);
  }, [events, startHour]);

  const nextEvent = useMemo(() => {
    const upcoming = eventsWithPositions.find(
      ({ endMin }) => endMin >= nowMin
    );
    return upcoming?.ev ?? null;
  }, [eventsWithPositions, nowMin]);

  const toggleComplete = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="relative w-full rounded-2xl glass-card p-5 border border-white/[0.08] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06] gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400">
            <CalendarClock className="w-4.5 w-[18px] h-[18px]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Hourly Study Timeline</h3>
            <p className="text-[11px] text-[#9B99B5]">
              {startHour < 10 ? `0${startHour}` : startHour}:00 → {String(endHour % 24).padStart(2, "0")}:00 · {events.length} sessions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {nowWithinRange && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/25 text-[10px] font-mono font-bold text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {minToHourLabel(nowMin)}
            </div>
          )}
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#9B99B5] px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-violet-500" /> Lecture
            <span className="w-2 h-2 rounded-full bg-cyan-500" /> Quiz
            <span className="w-2 h-2 rounded-full bg-purple-500" /> Cards
          </div>
        </div>
      </div>

      {/* Timeline Scroll Container */}
      <div className="relative max-h-[680px] overflow-y-auto no-scrollbar rounded-xl bg-[#0A0A14] border border-white/[0.04]">
        {/* Time rows */}
        <div
          className="relative"
          style={{
            minHeight: totalRows * ROW_HEIGHT,
            paddingLeft: TIME_GUTTER,
          }}
        >
          {/* Hour labels + row separators */}
          {Array.from({ length: totalRows }).map((_, idx) => {
            const h = (startHour + idx) % 24;
            const rowTop = idx * ROW_HEIGHT;
            const isCurrentHour = Math.floor(nowMin / 60) % 24 === h;
            return (
              <div
                key={`row-${h}`}
                className={cn(
                  "absolute left-0 right-0 flex border-b border-white/[0.04]",
                  isCurrentHour && "bg-amber-500/[0.02]"
                )}
                style={{ top: rowTop, height: ROW_HEIGHT }}
              >
                <span
                  className={cn(
                    "w-full pt-2 pl-3 text-[11px] font-mono font-bold text-right pr-3 shrink-0",
                    isCurrentHour ? "text-amber-400" : "text-[#5A5875]"
                  )}
                  style={{ width: TIME_GUTTER, marginLeft: -TIME_GUTTER }}
                >
                  {String(h).padStart(2, "0")}
                  <span className="text-[8px] opacity-70">:00</span>
                </span>
                {/* Half-hour mark */}
                <div
                  className="absolute left-0 right-0 border-b border-dashed border-white/[0.03]"
                  style={{ top: ROW_HEIGHT / 2 }}
                />
              </div>
            );
          })}

          {/* Now indicator line */}
          {nowWithinRange && (
            <>
              <div
                className="timeline-now-line pointer-events-none absolute left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 via-amber-300 to-transparent z-20"
                style={{
                  top: ((nowMin - startHour * 60) / 60) * ROW_HEIGHT,
                  left: TIME_GUTTER - 6,
                }}
              >
                <div className="absolute -left-[7px] -top-[5px] w-3 h-3 rounded-full bg-amber-400 ring-2 ring-[#0A0A14] shadow-lg shadow-amber-400/60" />
                <span className="absolute -left-[62px] -top-[9px] text-[10px] font-mono font-bold text-amber-300 whitespace-nowrap">
                  NOW
                </span>
              </div>
            </>
          )}

          {/* Event cards */}
          {eventsWithPositions.map(
            ({ ev, startPx, heightPx, startMin, endMin }) => {
              const stats = STATS_PER_EVENT[ev.id] ?? {
                pomodoros: 0,
                flashcards: 0,
                accuracy: 0,
              };
              const completed = completedIds.includes(ev.id);
              const isPast = endMin < nowMin;
              const isLive = nowMin >= startMin && nowMin <= endMin;
              const isNext = nextEvent?.id === ev.id && !isLive;
              const heightLimited = Math.max(64, heightPx);
              return (
                <div
                  key={ev.id}
                  className={cn(
                    "timeline-event absolute left-[72px] right-2 rounded-xl border p-2.5 z-10 transition-all cursor-pointer",
                    "hover:scale-[1.005] hover:-translate-y-0.5 hover:shadow-2xl",
                    completed && "opacity-75",
                    isLive && "ring-2 ring-amber-400/70 ring-offset-0 animate-pulse-slow"
                  )}
                  style={{
                    top: startPx + 2,
                    height: heightLimited,
                    backgroundColor: `${ev.subjectColor}12`,
                    borderColor: `${ev.subjectColor}40`,
                    boxShadow: `0 6px 24px -10px ${ev.subjectColor}40`,
                  }}
                  onMouseEnter={() => setHoveredId(ev.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Subject tint sidebar */}
                  <div
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                    style={{ backgroundColor: ev.subjectColor }}
                  />

                  <div className="flex items-start justify-between gap-2 pl-1.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        {isLive && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Live
                          </span>
                        )}
                        {isNext && !isLive && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/30 flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5" />
                            Up Next
                          </span>
                        )}
                        {getTypeBadge(ev.type)}
                        <span className="text-[10px] font-mono text-[#9B99B5]">
                          {minToHourLabel(startMin)}–{minToHourLabel(endMin)}
                        </span>
                      </div>

                      <h4
                        className={cn(
                          "text-sm font-bold leading-tight",
                          completed ? "line-through text-[#9B99B5]" : "text-[#F1F1F8]"
                        )}
                      >
                        {ev.title}
                      </h4>

                      <div className="flex items-center gap-2 mt-1 text-[10px] text-[#9B99B5] flex-wrap">
                        {ev.unitTitle && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-2.5 h-2.5" /> {ev.unitTitle}
                          </span>
                        )}
                        {ev.roomOrPlatform && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" /> {ev.roomOrPlatform}
                          </span>
                        )}
                      </div>

                      {/* Inline stats */}
                      {(isPast || completed || isLive) && heightLimited > 100 && (
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          {stats.pomodoros > 0 && (
                            <span
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                              style={{
                                color: ev.subjectColor,
                                backgroundColor: `${ev.subjectColor}15`,
                                border: `1px solid ${ev.subjectColor}30`,
                              }}
                            >
                              <Clock className="w-2.5 h-2.5" />
                              {stats.pomodoros} Pomos
                            </span>
                          )}
                          {stats.flashcards > 0 && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/25 text-[10px] font-semibold">
                              <BrainCircuit className="w-2.5 h-2.5" />
                              {stats.flashcards} cards
                            </span>
                          )}
                          {stats.accuracy > 0 && (
                            <span
                              className={cn(
                                "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold",
                                stats.accuracy >= 90
                                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
                                  : stats.accuracy >= 75
                                  ? "bg-amber-500/10 text-amber-300 border border-amber-500/25"
                                  : "bg-rose-500/10 text-rose-300 border border-rose-500/25"
                              )}
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              {stats.accuracy}% quiz
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right side actions */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComplete(ev.id);
                        }}
                        className={cn(
                          "p-1 rounded-md transition-colors",
                          completed
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-white/[0.04] text-[#5A5875] hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"
                        )}
                        title={completed ? "Mark incomplete" : "Mark complete"}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>

                      {hoveredId === ev.id && !completed && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartEvent?.(ev);
                          }}
                          className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all",
                            "text-white shadow-lg animate-[fadeIn_0.2s_ease-out]"
                          )}
                          style={{
                            backgroundColor: ev.subjectColor,
                          }}
                        >
                          <Play className="w-2.5 h-2.5 fill-white" /> Start
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Floating bottom Start CTA */}
      {nextEvent && (
        <div className="sticky bottom-0 mt-3 flex items-center justify-between pt-3 border-t border-white/[0.06] animate-[fadeIn_0.25s_ease-out]">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${nextEvent.subjectColor}20`,
                border: `1px solid ${nextEvent.subjectColor}50`,
              }}
            >
              <ChevronRight
                className="w-4.5 h-4.5"
                style={{ color: nextEvent.subjectColor }}
              />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#9B99B5]">
                {eventsWithPositions.find((p) => p.ev.id === nextEvent.id) &&
                  minToHourLabel(
                    eventsWithPositions.find((p) => p.ev.id === nextEvent.id)!.startMin
                  )}
                {" · "}
                Next session
              </div>
              <div className="text-sm font-bold text-white truncate">{nextEvent.title}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onStartEvent?.(nextEvent)}
            className="h-12 px-5 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow-xl shadow-violet-600/30 transition-all hover:scale-[1.02] shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            START NEXT SESSION
          </button>
        </div>
      )}
    </div>
  );
}
