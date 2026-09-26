"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import type { PomodoroSession, PomodoroSettings } from "@/types";

/* ──────────────────────────────────────────────────────────
   STORAGE KEYS & DEFAULTS
   ────────────────────────────────────────────────────────── */

const STORAGE_KEY = "exam_buddy_pomodoro_v1";

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  roundsUntilLongBreak: 4,
  autoAdvance: true,
};

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function readSession(): PomodoroSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PomodoroSession;
    if (parsed.dateKey === todayKey()) return parsed;
    return {
      ...parsed,
      isRunning: false,
      dateKey: todayKey(),
      todayTotalFocusMinutes: 0,
      completedRounds: 0,
    };
  } catch {
    return null;
  }
}

function fallbackSession(): PomodoroSession {
  return {
    mode: "focus",
    isRunning: false,
    timeLeftSeconds: DEFAULT_SETTINGS.focusMinutes * 60,
    completedRounds: 0,
    todayTotalFocusMinutes: 0,
    settings: DEFAULT_SETTINGS,
    dateKey: todayKey(),
  };
}

/* ──────────────────────────────────────────────────────────
   CONTEXT
   ────────────────────────────────────────────────────────── */

interface PomodoroContextValue {
  session: PomodoroSession;
  refresh: () => void;
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<PomodoroSession>(() => readSession() ?? fallbackSession());
  const initialLoadDone = useRef(false);

  /* Refresh helper — re-read from localStorage & update state */
  const refresh = () => {
    const next = readSession() ?? fallbackSession();
    setSession((prev) => {
      if (
        prev.mode === next.mode &&
        prev.isRunning === next.isRunning &&
        prev.timeLeftSeconds === next.timeLeftSeconds &&
        prev.completedRounds === next.completedRounds &&
        prev.todayTotalFocusMinutes === next.todayTotalFocusMinutes &&
        prev.dateKey === next.dateKey
      ) {
        return prev;
      }
      return next;
    });
  };

  /* Mount: initial read + same-tab polling tick + cross-tab StorageEvent */
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      refresh();
    }

    /* Same-tab sync: PomodoroTimer writes to localStorage each tick,
       but the storage event does NOT fire in the same tab that wrote.
       So we still poll once/sec to stay in sync *within* a tab.
       (This is the centralized replacement for NowStudyingWidget's old setInterval.) */
    const pollId = setInterval(refresh, 1000);

    /* Cross-tab sync: fires when *another* tab writes to localStorage under this key.
       This gives us true zero-latency cross-tab countdown sync. */
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) {
        refresh();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(pollId);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const value: PomodoroContextValue = { session, refresh };

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
}

export function usePomodoro(): PomodoroContextValue {
  const ctx = useContext(PomodoroContext);
  if (!ctx) {
    return { session: fallbackSession(), refresh: () => {} };
  }
  return ctx;
}
