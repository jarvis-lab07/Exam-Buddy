"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { PomodoroTimer } from "@/components/focus/PomodoroTimer";
import { AmbientPlayer } from "@/components/focus/AmbientPlayer";
import { HourlyRings } from "@/components/focus/HourlyRings";
import { DailyGoalRing } from "@/components/focus/DailyGoalRing";

interface FocusDockProps {
  className?: string;
}

export function FocusDock({ className }: FocusDockProps) {
  return (
    <aside
      className={cn(
        "focus-dock w-80 shrink-0 border-l border-white/[0.06] bg-[#0A0A13]/60 backdrop-blur-sm",
        "h-[calc(100vh-64px)] sticky top-16 overflow-y-auto no-scrollbar",
        "p-3 space-y-3",
        className
      )}
    >
      <div data-focus-dock-order="pomodoro">
        <PomodoroTimer size="full" />
      </div>
      <div data-focus-dock-order="ambient">
        <AmbientPlayer />
      </div>
      <div data-focus-dock-order="hourly-rings">
        <HourlyRings />
      </div>
      <div data-focus-dock-order="daily-ring">
        <DailyGoalRing />
      </div>
    </aside>
  );
}
