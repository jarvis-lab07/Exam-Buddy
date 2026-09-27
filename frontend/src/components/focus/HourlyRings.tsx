"use client";

import React, { useMemo } from "react";
import { Flame, Clock, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { WeeklyStudyDay } from "@/types";

interface HourlyRingsProps {
  startHour?: number;
  endHour?: number;
  targetMinutesPerHour?: number;
  weekly?: WeeklyStudyDay[];
  perHourData?: Record<number, { minutes: number; subjectColor?: string }>;
}

const DEFAULT_HOURLY = (() => {
  const sample: Record<number, { minutes: number; subjectColor?: string }> = {};
  const sampleHours: [number, number, string | undefined][] = [
    [8, 25, "#7C3AED"],
    [9, 52, "#10B981"],
    [10, 7, "#06B6D4"],
    [11, 60, "#7C3AED"],
    [13, 40, "#F59E0B"],
    [14, 35, "#10B981"],
    [15, 58, "#7C3AED"],
    [16, 18, "#EC4899"],
    [17, 44, "#06B6D4"],
    [18, 0, undefined],
    [19, 30, "#F59E0B"],
    [20, 20, "#10B981"],
  ];
  sampleHours.forEach(([h, m, c]) => (sample[h] = { minutes: m, subjectColor: c }));
  return sample;
})();

export function HourlyRings({
  startHour = 8,
  endHour = 22,
  targetMinutesPerHour = 60,
  weekly,
  perHourData,
}: HourlyRingsProps) {
  const hours = useMemo(() => {
    const arr: number[] = [];
    for (let h = startHour; h <= endHour; h++) arr.push(h);
    return arr;
  }, [startHour, endHour]);

  const now = new Date();
  const currentHour = now.getHours();

  const data = perHourData ?? DEFAULT_HOURLY;

  return (
    <div className="card p-3 space-y-2">
      <div className="flex items-center justify-between px-0.5">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#9B99B5]">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          Hourly Progress
        </span>
        <span className="text-[10px] text-[#5A5875] font-mono">
          {String(startHour).padStart(2, "0")}:00 → {String(endHour).padStart(2, "0")}:00
        </span>
      </div>

      <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
        {hours.map((h) => {
          const { minutes = 0, subjectColor } = data[h] ?? {};
          const pct = Math.min(100, Math.round((minutes / targetMinutesPerHour) * 100));
          const isNow = h === currentHour;
          const radius = 10;
          const circ = 2 * Math.PI * radius;
          const dashOffset = circ - (circ * pct) / 100;
          const tint = subjectColor ?? "#7C3AED";
          return (
            <div
              key={h}
              className={cn(
                "flex items-center gap-2.5 px-1.5 py-1 rounded-lg transition-all",
                isNow && "bg-white/[0.04] ring-1 ring-amber-400/30"
              )}
            >
              <span
                className={cn(
                  "w-9 text-[11px] font-mono font-bold text-right",
                  isNow ? "text-amber-400" : "text-[#9B99B5]"
                )}
              >
                {String(h).padStart(2, "0")}
              </span>
              <svg width="26" height="26" viewBox="0 0 26 26" className="-rotate-90 shrink-0">
                <circle
                  cx="13"
                  cy="13"
                  r={radius}
                  className="fill-none stroke-[#1A1A2E]"
                  strokeWidth="3"
                />
                <circle
                  cx="13"
                  cy="13"
                  r={radius}
                  className="fill-none transition-all duration-700 ease-out"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={dashOffset}
                  stroke={tint}
                  style={{ filter: `drop-shadow(0 0 3px ${tint}33)` }}
                />
              </svg>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-500",
                      pct === 100
                        ? "bg-gradient-to-r from-emerald-500 to-cyan-400 w-full"
                        : pct >= 60
                        ? "bg-gradient-to-r from-violet-500 to-indigo-500"
                        : pct >= 20
                        ? "bg-gradient-to-r from-amber-500/80 to-orange-500/80"
                        : "bg-white/[0.06]"
                    )}
                    style={{ width: `${Math.max(pct, pct > 0 ? 6 : 0)}%` }}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-mono ml-2 shrink-0",
                      pct === 100
                        ? "text-emerald-400 font-bold"
                        : isNow
                        ? "text-amber-400 font-bold"
                        : "text-[#9B99B5]"
                    )}
                  >
                    {pct}%
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-[#5A5875] font-mono w-8 text-right shrink-0">
                {minutes}m
              </span>
              {isNow && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
