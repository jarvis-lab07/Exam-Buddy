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
  Filter,
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
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 shrink-0">
          Lecture
        </span>
      );
    case "revision":
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/25 shrink-0">
          Revision
        </span>
      );
    case "quiz":
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 shrink-0">
          Speed Quiz
        </span>
      );
    case "flashcards":
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/25 shrink-0">
          Flashcards
        </span>
      );
    case "exam":
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/25 shrink-0">
          Mock Exam
        </span>
      );
  }
}

const STATS_PER_EVENT: Record<
  string,
  { pomodoros: number; flashcards: number; accuracy: number }
> = {
  "ev-1": { pomodoros: 2, flashcards: 18, accuracy: 86 },
  "ev-2": { pomodoros: 3, flashcards: 0, accuracy: 91 },
  "ev-3": { pomodoros: 4, flashcards: 45, accuracy: 78 },
  "ev-4": { pomodoros: 1, flashcards: 12, accuracy: 82 },
  "ev-5": { pomodoros: 3, flashcards: 28, accuracy: 95 },
};

interface EventWithPos {
  ev: CalendarEvent;
  startPx: number;
  heightPx: number;
  startMin: number;
  endMin: number;
  colIndex: number;
  maxCols: number;
}

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

  const currentDayName = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[now.getDay()];
  }, [now]);

  const [selectedDay, setSelectedDay] = useState<string>("All");

  // Auto select today if events exist for today
  useEffect(() => {
    if (events.some((e) => e.dayOfWeek === currentDayName)) {
      setSelectedDay(currentDayName);
    }
  }, [events, currentDayName]);

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowWithinRange =
    nowMin >= startHour * 60 && nowMin <= endHour * 60 + 60;

  const filteredEvents = useMemo(() => {
    if (selectedDay === "All") return events;
    return events.filter((ev) => ev.dayOfWeek === selectedDay);
  }, [events, selectedDay]);

  const eventsWithPositions = useMemo<EventWithPos[]>(() => {
    const rawItems = filteredEvents
      .map((ev) => {
        const { startMin, endMin } = parseTimeSlot(ev.timeSlot);
        const startPx = ((startMin - startHour * 60) / 60) * ROW_HEIGHT;
        const heightPx = ((endMin - startMin) / 60) * ROW_HEIGHT - 4;
        return {
          ev,
          startPx: Math.max(0, startPx),
          heightPx: Math.max(56, heightPx),
          startMin,
          endMin,
        };
      })
      .filter(({ startPx }) => startPx >= -ROW_HEIGHT)
      .sort((a, b) => a.startMin - b.startMin || (b.endMin - b.startMin) - (a.endMin - a.startMin));

    if (rawItems.length === 0) return [];

    // Group items that overlap in time into clusters
    const groups: (typeof rawItems)[] = [];
    let currentGroup: typeof rawItems = [];
    let currentGroupEnd = -1;

    for (const item of rawItems) {
      if (currentGroup.length === 0) {
        currentGroup.push(item);
        currentGroupEnd = item.endMin;
      } else if (item.startMin < currentGroupEnd) {
        currentGroup.push(item);
        currentGroupEnd = Math.max(currentGroupEnd, item.endMin);
      } else {
        groups.push(currentGroup);
        currentGroup = [item];
        currentGroupEnd = item.endMin;
      }
    }
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    // Assign column index and max columns per group
    const result: EventWithPos[] = [];
    for (const group of groups) {
      const colEnds: number[] = [];
      const itemCols: { item: (typeof rawItems)[0]; colIndex: number }[] = [];

      for (const item of group) {
        let assignedCol = -1;
        for (let c = 0; c < colEnds.length; c++) {
          if (colEnds[c] <= item.startMin) {
            assignedCol = c;
            colEnds[c] = item.endMin;
            break;
          }
        }
        if (assignedCol === -1) {
          assignedCol = colEnds.length;
          colEnds.push(item.endMin);
        }
        itemCols.push({ item, colIndex: assignedCol });
      }

      const maxCols = colEnds.length;
      for (const { item, colIndex } of itemCols) {
        result.push({
          ...item,
          colIndex,
          maxCols,
        });
      }
    }

    return result;
  }, [filteredEvents, startHour]);

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
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.06] gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400">
            <CalendarClock className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Hourly Study Timeline
              {selectedDay !== "All" && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {selectedDay} Schedule
                </span>
              )}
            </h3>
            <p className="text-[11px] text-[#9B99B5]">
              {startHour < 10 ? `0${startHour}` : startHour}:00 →{" "}
              {String(endHour % 24).padStart(2, "0")}:00 · {filteredEvents.length} sessions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {nowWithinRange && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/25 text-[10px] font-mono font-bold text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              NOW {minToHourLabel(nowMin)}
            </div>
          )}
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[#9B99B5] px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-indigo-400" /> Lecture
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Quiz
            <span className="w-2 h-2 rounded-full bg-purple-400" /> Cards
          </div>
        </div>
      </div>

      {/* Day Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3 border-b border-white/[0.04]">
        <span className="text-[11px] font-bold text-[#9B99B5] shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3 text-violet-400" /> Day:
        </span>
        {["All", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
          const isCurrent = currentDayName === day;
          const isSelected = selectedDay === day;
          const count =
            day === "All"
              ? events.length
              : events.filter((e) => e.dayOfWeek === day).length;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 flex items-center gap-1",
                isSelected
                  ? "bg-violet-500/25 text-violet-200 border border-violet-500/40 shadow-sm"
                  : "bg-white/[0.03] text-[#9B99B5] hover:text-white hover:bg-white/[0.06] border border-white/[0.06]"
              )}
            >
              {day === "All" ? "All Days" : day}
              {isCurrent && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"
                  title="Today"
                />
              )}
              <span className="text-[9px] opacity-70 px-1 py-0.2 rounded bg-white/[0.08]">
                {count}
              </span>
            </button>
          );
        })}
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
            <div
              className="timeline-now-line pointer-events-none absolute left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 via-amber-300 to-transparent z-20"
              style={{
                top: ((nowMin - startHour * 60) / 60) * ROW_HEIGHT,
                left: TIME_GUTTER - 6,
              }}
            >
              <div className="absolute -left-[7px] -top-[5px] w-3 h-3 rounded-full bg-amber-400 ring-2 ring-[#0A0A14]" />
              <span className="absolute -left-[62px] -top-[9px] text-[10px] font-mono font-bold text-amber-300 whitespace-nowrap">
                NOW
              </span>
            </div>
          )}

          {/* Empty state when no events match filter */}
          {eventsWithPositions.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-[#5A5875]">
              <CalendarClock className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs font-semibold">No study sessions scheduled for {selectedDay}.</p>
              <p className="text-[11px] mt-1 opacity-70">Switch day tab or click Schedule Session above.</p>
            </div>
          )}

          {/* Event cards with side-by-side overlap positioning */}
          {eventsWithPositions.map(
            ({ ev, startPx, heightPx, startMin, endMin, colIndex, maxCols }) => {
              const stats = STATS_PER_EVENT[ev.id] ?? {
                pomodoros: 0,
                flashcards: 0,
                accuracy: 0,
              };
              const completed = completedIds.includes(ev.id);
              const isPast = endMin < nowMin;
              const isLive = nowMin >= startMin && nowMin <= endMin;
              const isNext = nextEvent?.id === ev.id && !isLive;

              // Calculate width and left offset dynamically for side-by-side layout
              const leftCalc = `calc(72px + (100% - 80px) * ${colIndex / maxCols})`;
              const widthCalc = `calc((100% - 80px) / ${maxCols} - 4px)`;

              return (
                <div
                  key={ev.id}
                  className={cn(
                    "timeline-event absolute rounded-xl border p-2.5 z-10 transition-all cursor-pointer overflow-hidden flex flex-col justify-between",
                    completed && "opacity-75",
                    isLive && "ring-2 ring-amber-400/70 ring-offset-0 animate-pulse-slow"
                  )}
                  style={{
                    top: startPx + 2,
                    height: heightPx,
                    left: leftCalc,
                    width: widthCalc,
                    backgroundColor: `${ev.subjectColor}15`,
                    borderColor: `${ev.subjectColor}45`,
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

                  <div className="flex items-start justify-between gap-1.5 pl-1.5 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        {isLive && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Live
                          </span>
                        )}
                        {isNext && !isLive && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/30 flex items-center gap-1 shrink-0">
                            <Zap className="w-2.5 h-2.5" />
                            Up Next
                          </span>
                        )}
                        {getTypeBadge(ev.type)}
                        <span className="text-[10px] font-mono text-[#9B99B5] shrink-0">
                          {minToHourLabel(startMin)}–{minToHourLabel(endMin)}
                        </span>
                      </div>

                      <h4
                        className={cn(
                          "text-xs sm:text-sm font-bold leading-tight truncate",
                          completed ? "line-through text-[#9B99B5]" : "text-[#F1F1F8]"
                        )}
                        title={ev.title}
                      >
                        {ev.title}
                      </h4>

                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#9B99B5] truncate">
                        {ev.unitTitle && (
                          <span className="flex items-center gap-1 truncate">
                            <BookOpen className="w-2.5 h-2.5 shrink-0" /> {ev.unitTitle}
                          </span>
                        )}
                        {ev.roomOrPlatform && maxCols === 1 && (
                          <span className="hidden sm:flex items-center gap-1 truncate">
                            <MapPin className="w-2.5 h-2.5 shrink-0" /> {ev.roomOrPlatform}
                          </span>
                        )}
                      </div>

                      {/* Inline stats if height allows */}
                      {(isPast || completed || isLive) && heightPx > 90 && (
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                          {stats.pomodoros > 0 && (
                            <span
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold"
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
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/25 text-[9px] font-semibold">
                              <BrainCircuit className="w-2.5 h-2.5" />
                              {stats.flashcards} cards
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right side actions */}
                    <div className="flex flex-col items-end gap-1 shrink-0 z-10">
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
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-lg transition-all"
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
            className="h-10 sm:h-12 px-4 sm:px-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-black flex items-center gap-2 transition-colors shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            START NEXT SESSION
          </button>
        </div>
      )}
    </div>
  );
}

