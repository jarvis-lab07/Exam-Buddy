"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Flame, Trophy, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_STUDY_STATS, MOCK_USER } from "@/lib/mock-data";

interface DailyGoalRingProps {
  size?: "sm" | "lg";
  minutesLoggedOverride?: number;
  minutesTargetOverride?: number;
}

const STORAGE_KEY = "exam_buddy_daily_minutes";

export function DailyGoalRing({
  size = "lg",
  minutesLoggedOverride,
  minutesTargetOverride,
}: DailyGoalRingProps) {
  const [minutesLogged, setMinutesLogged] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return Number(raw) ?? 0;
    } catch {}
    return minutesLoggedOverride ?? 165;
  });

  const minutesTarget = minutesTargetOverride ?? 210;

  useEffect(() => {
    if (minutesLoggedOverride !== undefined) {
      setMinutesLogged(minutesLoggedOverride);
    }
  }, [minutesLoggedOverride]);

  const { pct, hours, mins } = useMemo(() => {
    const p = Math.min(100, Math.round((minutesLogged / minutesTarget) * 100));
    const h = Math.floor(minutesLogged / 60);
    const m = minutesLogged % 60;
    return { pct: p, hours: h, mins: m };
  }, [minutesLogged, minutesTarget]);

  const ringSize = size === "sm" ? 140 : 160;
  const strokeW = size === "sm" ? 10 : 12;
  const radius = (ringSize - strokeW) / 2;
  const circ = 2 * Math.PI * radius;
  const dashOffset = circ - (circ * pct) / 100;

  return (
    <div className="card p-4 flex flex-col items-center space-y-3">
      <div className="flex items-center justify-between w-full px-0.5">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#9B99B5]">
          <Target className="w-3.5 h-3.5 text-violet-400" />
          Daily Goal
        </span>
        <span className="text-[10px] text-violet-300 font-semibold bg-violet-500/15 px-1.5 py-0.5 rounded-md border border-violet-500/25">
          {pct}%
        </span>
      </div>

      <div className="relative" style={{ width: ringSize, height: ringSize }}>
        <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`} className="-rotate-90">
          <defs>
            <linearGradient id="goalRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="55%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            className="fill-none stroke-[#1A1A2E]"
            strokeWidth={strokeW}
          />
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            className="fill-none transition-all duration-1000 ease-out"
            strokeWidth={strokeW}
            strokeLinecap="round"
            stroke="url(#goalRingGradient)"
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            style={{ filter: "drop-shadow(0 0 6px rgba(124, 58, 237, 0.35))" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-[#9B99B5] font-semibold uppercase tracking-wider">Logged</span>
          <span className="text-3xl font-black font-mono tracking-tighter mt-0.5">
            {hours}
            <span className="text-lg font-bold text-[#9B99B5]">
              h {String(mins).padStart(2, "0")}m
            </span>
          </span>
          <span className="text-[10px] text-[#5A5875] mt-1 font-mono">
            / {Math.floor(minutesTarget / 60)}h {minutesTarget % 60}m target
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 w-full">
        <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Flame className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-[#9B99B5] leading-none">Streak</div>
            <div className="text-sm font-black text-white mt-0.5 font-mono leading-none">
              {MOCK_USER.streakDays}
              <span className="text-[10px] font-semibold text-[#9B99B5] ml-0.5">days</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-[#9B99B5] leading-none">Cohort</div>
            <div className="text-sm font-black text-white mt-0.5 font-mono leading-none">
              Top 5
              <span className="text-[10px] font-semibold text-[#9B99B5] ml-0.5">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
