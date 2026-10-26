"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Zap,
  Clock,
  Target,
  AlertTriangle,
  Play,
  RotateCw,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Sparkles,
  Layers,
} from "lucide-react";
import { CompetitiveExamSimulatorModal } from "@/components/exam/CompetitiveExamSimulatorModal";
import { cn } from "@/lib/utils";

interface ExamPreset {
  id: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  questionCount: number;
  markingRule: string;
  badge: string;
  accentColor: string;
}

const EXAM_PRESETS: ExamPreset[] = [
  {
    id: "gate-demo",
    title: "GATE CS / Competitive Simulation",
    subtitle: "3-minute fast-paced demonstration test covering AVL balance rotations, B-Trees, and SHA-256.",
    durationMinutes: 3,
    questionCount: 3,
    markingRule: "+4 for Correct · -1 Negative Marking",
    badge: "Official Live Demo",
    accentColor: "#EF4444",
  },
  {
    id: "sem-final",
    title: "University Semester 5 Comprehensive Mock",
    subtitle: "Rigorous test covering Cyber Security, BI, Machine Learning, Automata, and Advanced Algorithms.",
    durationMinutes: 45,
    questionCount: 20,
    markingRule: "+2 for Correct · No Negative Marking",
    badge: "Comprehensive",
    accentColor: "#8B5CF6",
  },
  {
    id: "speed-blitz",
    title: "High-Yield Speed Recall Blitz",
    subtitle: "Rapid-fire testing designed to challenge answer recall speed and expose conceptual traps.",
    durationMinutes: 10,
    questionCount: 10,
    markingRule: "+1 for Correct · -0.25 Penalty",
    badge: "Speed Challenge",
    accentColor: "#F59E0B",
  },
];

export default function ExamSimulatorPage() {
  const [selectedPreset, setSelectedPreset] = useState<ExamPreset>(EXAM_PRESETS[0]);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* 1. Hero Header Banner */}
      <section className="relative overflow-hidden rounded-2xl card p-6 sm:p-8 border-t-2 border-rose-500/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>Negative Marking Engine & Speed Tracker</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Competitive Exam Simulator & Practice Arena
            </h1>

            <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed font-medium">
              Train under realistic exam pressure. Features real-time countdown clocks, per-question speed metrics, negative marking calculations, and automated error logging into the Mistake Notebook.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-rose-400" />
                Negative Marking: <strong className="text-rose-300">+4 / -1 Penalty</strong>
              </span>
              <span className="text-[var(--border-card)]">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Speed Metric: <strong className="text-emerald-400">Seconds / Question</strong>
              </span>
              <span className="text-[var(--border-card)]">•</span>
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-cyan-400" />
                Error Handling: <strong className="text-cyan-300">Auto-saved Mistake Notebook</strong>
              </span>
            </div>
          </div>

          {/* Quick Launch Button */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSimulatorOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-rose-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Live Exam Simulator</span>
            </button>

            <Link
              href="/flashcards?filterDeck=deck-mistakes"
              className="px-4 py-3.5 rounded-2xl bg-[var(--input-bg)] hover:bg-[var(--bg-elevated)] border border-[var(--border-card)] text-[var(--text-secondary)] hover:text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <BookOpen className="w-4 h-4 text-rose-400" />
              <span>Mistake Notebook</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Exam Mode Presets */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Select Examination Preset
          </h2>
          <span className="text-xs text-[var(--text-muted)]">Click preset to select active mode</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {EXAM_PRESETS.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => setSelectedPreset(preset)}
                className={cn(
                  "card p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group space-y-3",
                  isSelected
                    ? "border-rose-500/60 shadow-xl shadow-rose-500/10 bg-[var(--bg-elevated)]"
                    : "border-[var(--border-card)] hover:border-[var(--border-hover)]"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                    style={{
                      backgroundColor: `${preset.accentColor}20`,
                      color: preset.accentColor,
                      border: `1px solid ${preset.accentColor}40`,
                    }}
                  >
                    {preset.badge}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                      Active Preset
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-rose-300 transition-colors">
                    {preset.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">
                    {preset.subtitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--border-card)] flex items-center justify-between text-xs text-[var(--text-secondary)] font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {preset.durationMinutes} mins
                  </span>
                  <span>•</span>
                  <span>{preset.questionCount} Questions</span>
                </div>

                <div className="text-[11px] text-rose-400 font-semibold bg-rose-500/10 p-2 rounded-xl border border-rose-500/20 text-center">
                  {preset.markingRule}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Competitive Readiness & Mistake Notebook Insights */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Metric Cards (2 cols) */}
        <div className="lg:col-span-2 card p-6 rounded-2xl border-[var(--border-card)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Exam Performance & Speed Analytics
            </h3>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
              Live Benchmark
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-card)]">
              <span className="text-2xl font-black text-rose-400 font-mono">3</span>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Tests Completed</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-card)]">
              <span className="text-2xl font-black text-emerald-400 font-mono">88.4%</span>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Overall Accuracy</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-card)]">
              <span className="text-2xl font-black text-indigo-400 font-mono">24s</span>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Avg Speed / Q</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-card)]">
              <span className="text-2xl font-black text-amber-400 font-mono">Fast</span>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Speed Rating</p>
            </div>
          </div>

          {/* Tips Card */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Evaluator Exam Tip:</span> In competitive multiple choice exams, guessing randomly incurs a severe -1 mark penalty per error. Skipping unknown questions preserves raw points and maintains your overall percentile!
            </div>
          </div>
        </div>

        {/* Mistake Notebook Quick Card (1 col) */}
        <div className="card p-6 rounded-2xl border-[var(--border-card)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              The Mistake Notebook
            </h3>
            <span className="text-[10px] font-bold text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30">
              Error Log
            </span>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Every incorrect response from your practice quizzes and exams is automatically cataloged here with deep trap explanations so you never repeat the same error twice.
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-[var(--border-card)] flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">AVL Zig-Zag Rotations</span>
              <span className="font-bold text-rose-400 font-mono">2 Traps</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-[var(--border-card)] flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Deadlock Coffman Conditions</span>
              <span className="font-bold text-rose-400 font-mono">1 Trap</span>
            </div>
          </div>

          <Link
            href="/flashcards?filterDeck=deck-mistakes"
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Mistake Notebook Deck</span>
          </Link>
        </div>
      </section>

      {/* 4. Active Competitive Exam Modal */}
      <CompetitiveExamSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        examTitle={selectedPreset.title}
      />
    </div>
  );
}
