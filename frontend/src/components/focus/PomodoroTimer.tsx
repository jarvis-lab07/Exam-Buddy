"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Moon,
  SkipForward,
  Sparkles,
  Volume2,
  VolumeX,
  Settings2,
  Target,
  Flame,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PomodoroMode, PomodoroSettings, PomodoroSession } from "@/types";

/* ──────────────────────────────────────────────────────────
   STORAGE KEYS & DEFAULTS
   ────────────────────────────────────────────────────────── */

const STORAGE_KEY = "exam_buddy_pomodoro_v1";
const CHIME_KEY = "exam_buddy_pomodoro_chime_enabled";

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  roundsUntilLongBreak: 4,
  autoAdvance: true,
};

const FOCUS_PRESETS = [15, 25, 45, 60];
const SHORT_BREAK_PRESETS = [5, 10];
const LONG_BREAK_PRESETS = [15, 30];

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function loadStoredSession(): PomodoroSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PomodoroSession;
      if (parsed.dateKey === todayKey()) return parsed;
      return {
        ...parsed,
        isRunning: false,
        dateKey: todayKey(),
        todayTotalFocusMinutes: 0,
        completedRounds: 0,
      };
    }
  } catch {}
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
   AUDIO CHIME via Web Audio API (no assets required)
   ────────────────────────────────────────────────────────── */

function playChime() {
  try {
    const AudioCtx =
      (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const notes = [660, 880, 1175];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.18);
      gain.gain.setValueAtTime(0.0001, now + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.25, now + i * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.55);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.18);
      osc.stop(now + i * 0.18 + 0.6);
    });
    setTimeout(() => ctx.close(), 2000);
  } catch {}
}

/* ──────────────────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────────────────── */

interface PomodoroTimerProps {
  size?: "compact" | "full";
}

export function PomodoroTimer({ size = "full" }: PomodoroTimerProps) {
  const initial = useMemo(loadStoredSession, []);
  const [session, setSession] = useState<PomodoroSession>(initial);
  const [chimeEnabled, setChimeEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(CHIME_KEY) !== "0";
    } catch {
      return true;
    }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [completionPulse, setCompletionPulse] = useState<null | PomodoroMode>(null);
  const justCompletedRef = useRef(false);

  /* Persist session on any change */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {}
  }, [session]);

  useEffect(() => {
    try {
      localStorage.setItem(CHIME_KEY, chimeEnabled ? "1" : "0");
    } catch {}
  }, [chimeEnabled]);

  /* Tick interval */
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (session.isRunning && session.timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setSession((prev) => ({
          ...prev,
          timeLeftSeconds: prev.timeLeftSeconds - 1,
        }));
      }, 1000);
    } else if (session.isRunning && session.timeLeftSeconds === 0 && !justCompletedRef.current) {
      justCompletedRef.current = true;
      handlePhaseComplete();
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.isRunning, session.timeLeftSeconds]);

  /* Reset "just completed" gate when timer advances */
  useEffect(() => {
    if (session.timeLeftSeconds > 0) justCompletedRef.current = false;
  }, [session.mode, session.timeLeftSeconds]);

  const totalSecondsForMode = useCallback(
    (mode: PomodoroMode) => {
      const { settings } = session;
      switch (mode) {
        case "focus":
          return settings.focusMinutes * 60;
        case "shortBreak":
          return settings.shortBreakMinutes * 60;
        case "longBreak":
          return settings.longBreakMinutes * 60;
      }
    },
    [session.settings]
  );

  const switchToMode = useCallback(
    (mode: PomodoroMode, runNow = false) => {
      setSession((prev) => ({
        ...prev,
        mode,
        isRunning: runNow && prev.settings.autoAdvance ? true : false,
        timeLeftSeconds:
          mode === "focus"
            ? prev.settings.focusMinutes * 60
            : mode === "shortBreak"
            ? prev.settings.shortBreakMinutes * 60
            : prev.settings.longBreakMinutes * 60,
      }));
    },
    []
  );

  const handlePhaseComplete = useCallback(() => {
    if (chimeEnabled) playChime();

    setSession((prev) => {
      const next: PomodoroSession = { ...prev, isRunning: false };
      const justFinished = prev.mode;

      setCompletionPulse(justFinished);
      setTimeout(() => setCompletionPulse(null), 2200);

      if (justFinished === "focus") {
        const newCompleted = prev.completedRounds + 1;
        const newTodayMin = prev.todayTotalFocusMinutes + prev.settings.focusMinutes;
        const reachedLongBreakTarget =
          newCompleted > 0 && newCompleted % prev.settings.roundsUntilLongBreak === 0;
        const nextMode: PomodoroMode = reachedLongBreakTarget ? "longBreak" : "shortBreak";
        const nextSecs =
          nextMode === "longBreak"
            ? prev.settings.longBreakMinutes * 60
            : prev.settings.shortBreakMinutes * 60;
        return {
          ...next,
          completedRounds: newCompleted,
          todayTotalFocusMinutes: newTodayMin,
          mode: nextMode,
          timeLeftSeconds: nextSecs,
          isRunning: prev.settings.autoAdvance,
        };
      }
      return {
        ...next,
        mode: "focus",
        timeLeftSeconds: prev.settings.focusMinutes * 60,
        isRunning: prev.settings.autoAdvance,
      };
    });
  }, [chimeEnabled]);

  const toggleTimer = () =>
    setSession((prev) => ({ ...prev, isRunning: !prev.isRunning }));

  const resetTimer = () =>
    setSession((prev) => ({
      ...prev,
      isRunning: false,
      timeLeftSeconds: totalSecondsForMode(prev.mode),
    }));

  const skipPhase = () => handlePhaseComplete();

  const applyPreset = (mode: PomodoroMode, minutes: number) => {
    setSession((prev) => {
      const settings = { ...prev.settings };
      if (mode === "focus") settings.focusMinutes = minutes;
      else if (mode === "shortBreak") settings.shortBreakMinutes = minutes;
      else settings.longBreakMinutes = minutes;
      return {
        ...prev,
        settings,
        mode,
        isRunning: false,
        timeLeftSeconds: minutes * 60,
      };
    });
  };

  const cycleModeSettings = (
    key: keyof Pick<PomodoroSettings, "focusMinutes" | "shortBreakMinutes" | "longBreakMinutes" | "roundsUntilLongBreak">,
    delta: number
  ) => {
    setSession((prev) => {
      const settings = { ...prev.settings };
      if (key === "roundsUntilLongBreak") {
        settings.roundsUntilLongBreak = Math.max(2, Math.min(8, settings.roundsUntilLongBreak + delta));
      } else {
        settings[key] = Math.max(1, Math.min(120, settings[key] + delta));
      }
      const rebuild: PomodoroSession = { ...prev, settings };
      rebuild.timeLeftSeconds = totalSecondsForModeInSettings(settings, prev.mode);
      rebuild.isRunning = false;
      return rebuild;
    });
  };

  const toggleAutoAdvance = () =>
    setSession((prev) => ({
      ...prev,
      settings: { ...prev.settings, autoAdvance: !prev.settings.autoAdvance },
    }));

  const minutes = Math.floor(session.timeLeftSeconds / 60);
  const seconds = session.timeLeftSeconds % 60;
  const progress =
    100 - (session.timeLeftSeconds / Math.max(1, totalSecondsForMode(session.mode))) * 100;

  const isCompact = size === "compact";

  const modeMeta = useMemo(
    () => ({
      focus: {
        label: "Focus",
        shortLabel: "Focus",
        Icon: Brain,
        ringColor: "stroke-violet-500",
        accentClass: "bg-violet-500/20 text-violet-300 border-violet-500/30",
        buttonBg: "bg-violet-600 hover:bg-violet-500",
        presets: FOCUS_PRESETS,
        presetMin: "focus" as PomodoroMode,
      },
      shortBreak: {
        label: "Short Break",
        shortLabel: "Break",
        Icon: Coffee,
        ringColor: "stroke-emerald-500",
        accentClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        buttonBg: "bg-emerald-600 hover:bg-emerald-500",
        presets: SHORT_BREAK_PRESETS,
        presetMin: "shortBreak" as PomodoroMode,
      },
      longBreak: {
        label: "Long Break",
        shortLabel: "Long",
        Icon: Moon,
        ringColor: "stroke-cyan-500",
        accentClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
        buttonBg: "bg-cyan-600 hover:bg-cyan-500",
        presets: LONG_BREAK_PRESETS,
        presetMin: "longBreak" as PomodoroMode,
      },
    }),
    []
  );

  const mm = modeMeta[session.mode];
  const roundsTotal = session.settings.roundsUntilLongBreak;
  const roundProgress = ((session.completedRounds % roundsTotal) / roundsTotal) * 100;

  /* ── COMPACT LAYOUT (Sidebar) ── */
  if (isCompact) {
    return (
      <div className="card p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => switchToMode("focus")}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all",
              session.mode === "focus"
                ? mm.accentClass + " border"
                : "text-[#9B99B5] hover:text-white"
            )}
          >
            <Brain className="w-3 h-3" />
            Focus
          </button>
          <div className="flex items-center gap-1 text-[10px] font-mono text-[#9B99B5]">
            <Target className="w-3 h-3 text-amber-400" />
            {session.completedRounds}/{roundsTotal}
          </div>
        </div>

        <div className="relative w-full aspect-square max-w-[140px] mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              className="stroke-[#1A1A2E] fill-none"
              strokeWidth="6"
            />
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              className={cn("fill-none transition-all duration-1000 ease-linear", mm.ringColor)}
              strokeWidth="6"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * progress) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span
              className={cn(
                "text-2xl font-black font-mono tracking-tighter",
                completionPulse ? "animate-pulse text-white" : "text-white"
              )}
            >
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-[#9B99B5] mt-0.5">{mm.shortLabel}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={toggleTimer}
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-full transition-colors",
              mm.buttonBg
            )}
          >
            {session.isRunning ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white translate-x-0.5" />
            )}
          </button>
          <button
            onClick={resetTimer}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1A1A2E] hover:bg-white/[0.06] border border-white/[0.06] text-[#9B99B5] hover:text-white transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={skipPhase}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1A1A2E] hover:bg-white/[0.06] border border-white/[0.06] text-[#9B99B5] hover:text-white transition-colors"
            title="Skip to next phase"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/[0.05]">
          <span className="flex items-center gap-1 text-[#9B99B5]">
            <Flame className="w-3 h-3 text-amber-400" />
            {session.todayTotalFocusMinutes}m today
          </span>
          <button
            onClick={() => setChimeEnabled((v) => !v)}
            className={cn(
              "p-1 rounded hover:bg-white/[0.06] transition-colors",
              chimeEnabled ? "text-emerald-400" : "text-[#5A5875]"
            )}
            title={chimeEnabled ? "Mute chime" : "Enable chime"}
          >
            {chimeEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          </button>
        </div>
      </div>
    );
  }

  /* ── FULL LAYOUT ── */
  return (
    <div className="card p-4 flex flex-col items-center space-y-4 relative overflow-hidden">
      {/* Completion sparkle banner */}
      {completionPulse && (
        <div className="absolute inset-x-0 top-0 z-10 pointer-events-none">
          <div className="mx-2 mt-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-500/30 to-cyan-500/30 border border-white/10 backdrop-blur-md flex items-center justify-center gap-1.5 text-[11px] font-bold text-white animate-[fadeIn_0.2s_ease-out]">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            {completionPulse === "focus"
              ? `Round Complete! +${session.settings.focusMinutes}m focused`
              : completionPulse === "shortBreak"
              ? "Break over — back to focus!"
              : "Long break complete. Fresh cycle starts!"}
          </div>
        </div>
      )}

      {/* Mode switcher */}
      <div className="flex gap-1.5 w-full p-1 bg-[#1A1A2E] rounded-lg">
        {(["focus", "shortBreak", "longBreak"] as PomodoroMode[]).map((m) => {
          const meta = modeMeta[m];
          const Ic = meta.Icon;
          const active = session.mode === m;
          return (
            <button
              key={m}
              onClick={() => switchToMode(m, false)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold rounded-md transition-all",
                active
                  ? meta.accentClass + " border"
                  : "text-[#9B99B5] hover:text-[#F1F1F8]"
              )}
            >
              <Ic className="w-3.5 h-3.5" />
              {m === "shortBreak" ? "Break" : m === "longBreak" ? "Long" : "Focus"}
            </button>
          );
        })}
      </div>

      {/* Progress ring */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="60"
            className="stroke-[#1A1A2E] fill-none"
            strokeWidth="5"
          />
          <circle
            cx="64"
            cy="64"
            r="60"
            className={cn("fill-none transition-all duration-1000 ease-linear", mm.ringColor)}
            strokeWidth="5"
            strokeDasharray="377"
            strokeDashoffset={377 - (377 * progress) / 100}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span
            className={cn(
              "text-3xl font-bold tracking-tighter font-mono",
              completionPulse ? "animate-pulse" : ""
            )}
          >
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9B99B5] mt-0.5">
            {mm.label}
          </span>
        </div>
      </div>

      {/* Round / cycle progress */}
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 text-[#9B99B5]">
            <Target className="w-3 h-3 text-amber-400" />
            Cycle {session.completedRounds % roundsTotal}/{roundsTotal} • Total {session.completedRounds}
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-medium">
            <Flame className="w-3 h-3" />
            {session.todayTotalFocusMinutes}m today
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: roundsTotal }).map((_, idx) => {
            const positionInCycle = session.completedRounds % roundsTotal;
            const done =
              session.completedRounds >= roundsTotal
                ? idx < positionInCycle || true
                : idx < positionInCycle;
            const current = idx === positionInCycle && session.mode === "focus";
            return (
              <div
                key={idx}
                className={cn(
                  "flex-1 h-1.5 rounded-full transition-all duration-500",
                  done
                    ? "bg-gradient-to-r from-violet-500 to-cyan-500"
                    : current
                    ? "bg-violet-500/60 animate-pulse"
                    : "bg-white/[0.08]"
                )}
              />
            );
          })}
        </div>
        <div
          className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden"
          aria-hidden
        >
          <div
            className="h-full bg-gradient-to-r from-violet-500/70 to-emerald-500/70 transition-all duration-300"
            style={{ width: `${roundProgress}%` }}
          />
        </div>
      </div>

      {/* Duration preset pills */}
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5A5875]">
            Presets
          </span>
          <button
            onClick={() => setShowSettings((v) => !v)}
            className={cn(
              "flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md transition-colors",
              showSettings
                ? "bg-white/[0.08] text-white"
                : "text-[#9B99B5] hover:text-white hover:bg-white/[0.05]"
            )}
          >
            <Settings2 className="w-3 h-3" />
            {showSettings ? "Close" : "Custom"}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {mm.presets.map((mins) => (
            <button
              key={mins}
              onClick={() => applyPreset(mm.presetMin, mins)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all",
                (session.mode === mm.presetMin &&
                  Math.floor(totalSecondsForMode(session.mode) / 60) === mins)
                  ? mm.accentClass
                  : "bg-white/[0.03] text-[#9B99B5] hover:text-white border-white/[0.06] hover:border-white/[0.12]"
              )}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Custom settings panel */}
        {showSettings && (
          <div className="mt-2 space-y-2 p-2.5 rounded-xl bg-black/30 border border-white/[0.08] animate-[fadeIn_0.2s_ease-out]">
            <StepperRow
              label="Focus"
              value={session.settings.focusMinutes}
              onInc={() => cycleModeSettings("focusMinutes", 5)}
              onDec={() => cycleModeSettings("focusMinutes", -5)}
              suffix="min"
            />
            <StepperRow
              label="Short Break"
              value={session.settings.shortBreakMinutes}
              onInc={() => cycleModeSettings("shortBreakMinutes", 1)}
              onDec={() => cycleModeSettings("shortBreakMinutes", -1)}
              suffix="min"
            />
            <StepperRow
              label="Long Break"
              value={session.settings.longBreakMinutes}
              onInc={() => cycleModeSettings("longBreakMinutes", 5)}
              onDec={() => cycleModeSettings("longBreakMinutes", -5)}
              suffix="min"
            />
            <StepperRow
              label="Rounds / Long"
              value={session.settings.roundsUntilLongBreak}
              onInc={() => cycleModeSettings("roundsUntilLongBreak", 1)}
              onDec={() => cycleModeSettings("roundsUntilLongBreak", -1)}
              suffix="rounds"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#9B99B5]">Auto-advance phases</span>
              <button
                type="button"
                onClick={toggleAutoAdvance}
                className={cn(
                  "w-9 h-5 rounded-full relative transition-colors",
                  session.settings.autoAdvance
                    ? "bg-violet-600"
                    : "bg-white/[0.1]"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                    session.settings.autoAdvance ? "left-[18px]" : "left-0.5"
                  )}
                />
              </button>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="flex items-center justify-center gap-1 w-full mt-1 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-[11px] text-[#9B99B5] hover:text-white transition-colors"
            >
              <X className="w-3 h-3" /> Close settings
            </button>
          </div>
        )}
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={resetTimer}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1A1A2E] hover:bg-white/[0.06] border border-white/[0.06] text-[#9B99B5] hover:text-white transition-colors"
          title="Reset timer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={toggleTimer}
          className={cn(
            "flex items-center justify-center w-11 h-11 rounded-full transition-colors shadow-lg shadow-black/20",
            mm.buttonBg
          )}
          title={session.isRunning ? "Pause" : "Start"}
        >
          {session.isRunning ? (
            <Pause className="w-4.5 h-4.5 w-[18px] h-[18px] text-white" />
          ) : (
            <Play className="w-4.5 h-4.5 w-[18px] h-[18px] text-white translate-x-0.5" />
          )}
        </button>
        <button
          onClick={skipPhase}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1A1A2E] hover:bg-white/[0.06] border border-white/[0.06] text-[#9B99B5] hover:text-white transition-colors"
          title="Skip phase"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setChimeEnabled((v) => !v)}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full border transition-colors",
            chimeEnabled
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
              : "bg-[#1A1A2E] border-white/[0.06] text-[#5A5875] hover:text-white"
          )}
          title={chimeEnabled ? "Mute chime" : "Enable chime"}
        >
          {chimeEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   SUBCOMPONENTS
   ────────────────────────────────────────────────────────── */

function totalSecondsForModeInSettings(
  settings: PomodoroSettings,
  mode: PomodoroMode
) {
  switch (mode) {
    case "focus":
      return settings.focusMinutes * 60;
    case "shortBreak":
      return settings.shortBreakMinutes * 60;
    case "longBreak":
      return settings.longBreakMinutes * 60;
  }
}

function StepperRow({
  label,
  value,
  onInc,
  onDec,
  suffix,
}: {
  label: string;
  value: number;
  onInc: () => void;
  onDec: () => void;
  suffix?: string;
}) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-[#9B99B5]">{label}</span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onDec}
          className="w-5 h-5 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-[#9B99B5] hover:text-white border border-white/[0.06] flex items-center justify-center transition-colors"
        >
          −
        </button>
        <span className="w-14 text-center font-mono text-white font-semibold">
          {value}
          {suffix && <span className="text-[#9B99B5] text-[10px] ml-0.5">{suffix}</span>}
        </span>
        <button
          type="button"
          onClick={onInc}
          className="w-5 h-5 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-[#9B99B5] hover:text-white border border-white/[0.06] flex items-center justify-center transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
