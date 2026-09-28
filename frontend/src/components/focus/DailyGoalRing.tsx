"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Flame, Trophy, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_STUDY_STATS, MOCK_USER } from "@/lib/mock-data";

interface DailyGoalRingProps {
  size?: "sm" | "lg";
  minutesLoggedOverride?: number;
  minutesTargetOverride?: number;
  hideWrapperCard?: boolean;
}

const STORAGE_KEY = "exam_buddy_daily_minutes";

export function DailyGoalRing({
  size = "lg",
  minutesLoggedOverride,
  minutesTargetOverride,
  hideWrapperCard = false,
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

  const content = (
    <div className="flex flex-col items-center space-y-3.5 w-full">
      {!hideWrapperCard && (
        <div className="flex items-center justify-between w-full px-0.5">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            <Target className="w-3.5 h-3.5 text-violet-400" />
            Daily Goal
          </span>
          <span className="text-[10px] text-violet-400 font-semibold bg-violet-500/15 px-1.5 py-0.5 rounded-md border border-violet-500/25 font-mono">
            {pct}%
          </span>
        </div>
      )}

      <div className="relative my-1" style={{ width: ringSize, height: ringSize }}>
        <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`} className="-rotate-90">
          <defs>
            <linearGradient id="goalRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            className="fill-none stroke-[var(--input-bg)]"
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
            style={{ filter: "drop-shadow(0 0 6px rgba(16, 185, 129, 0.35))" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">Logged</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl font-black font-mono tracking-tight text-[var(--text-primary)]">
              {hours}h
            </span>
            <span className="text-lg font-bold font-mono text-[var(--text-secondary)]">
              {String(mins).padStart(2, "0")}m
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">
            / {Math.floor(minutesTarget / 60)}h {minutesTarget % 60}m target
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 w-full pt-1">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Flame className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-[var(--text-muted)] leading-none font-medium">Streak</div>
            <div className="text-xs font-black text-[var(--text-primary)] mt-1 font-mono leading-none flex items-baseline gap-0.5">
              {MOCK_USER.streakDays}
              <span className="text-[10px] font-semibold text-[var(--text-muted)]">days</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-[var(--text-muted)] leading-none font-medium">Cohort</div>
            <div className="text-xs font-black text-[var(--text-primary)] mt-1 font-mono leading-none flex items-baseline gap-0.5">
              Top 5
              <span className="text-[10px] font-semibold text-[var(--text-muted)]">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (hideWrapperCard) return content;

  return <div className="card p-4 flex flex-col items-center">{content}</div>;
}
