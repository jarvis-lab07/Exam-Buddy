"use client";

import React, { useState } from "react";
import {
  RotateCw,
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Clock,
  Zap,
  Code,
  AlertTriangle,
} from "lucide-react";
import { Flashcard } from "@/types";

interface Flashcard3DProps {
  card: Flashcard;
  onRate: (rating: "again" | "hard" | "good" | "easy") => void;
}

export function Flashcard3D({ card, onRate }: Flashcard3DProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Reset flip and hint when card changes
  React.useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
  }, [card.id]);

  const handleRate = (e: React.MouseEvent, rating: "again" | "hard" | "good" | "easy") => {
    e.stopPropagation();
    onRate(rating);
  };

  const getDifficultyBadge = (diff: Flashcard["difficulty"]) => {
    switch (diff) {
      case "easy":
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">Easy</span>;
      case "medium":
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/25">Medium</span>;
      case "hard":
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/25">Hard</span>;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto perspective-1000 min-h-[380px] sm:min-h-[420px] select-none">
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className={`relative w-full h-full min-h-[380px] sm:min-h-[420px] transition-transform duration-500 transform-style-3d cursor-pointer ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* ================= FRONT SIDE ================= */}
        <div className="absolute inset-0 w-full h-full backface-hidden glass-card p-6 sm:p-8 rounded-3xl border border-white/[0.12] bg-gradient-to-b from-[#151627] to-[#0E0F1A] shadow-2xl flex flex-col justify-between space-y-4">
          {/* Front Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{
                  backgroundColor: `${card.subjectColor}20`,
                  color: card.subjectColor,
                }}
              >
                {card.subjectCode}
              </span>
              {card.unitTitle && (
                <span className="text-xs text-[#9B99B5] font-medium hidden sm:inline-block">
                  {card.unitTitle}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {getDifficultyBadge(card.difficulty)}
              <span className="text-[11px] text-slate-500 font-mono">
                {card.deckType === "mistake-notebook" ? "🔥 Weak Spot" : "High-Yield"}
              </span>
            </div>
          </div>

          {/* Front Body: Question */}
          <div className="flex-1 flex flex-col justify-center my-auto py-4 space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-violet-400 font-semibold flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Exam Recall Question
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {card.question}
            </h2>

            {/* Hint Box (if available) */}
            {card.hint && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHint(!showHint);
                }}
                className="pt-2"
              >
                {showHint ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{card.hint}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="text-xs text-amber-400/80 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Need a hint? Click to reveal</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Front Footer */}
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-violet-400" />
              Click card to reveal answer
            </span>
            <span className="font-mono text-[11px] text-slate-500">Spacebar ␣</span>
          </div>
        </div>

        {/* ================= BACK SIDE ================= */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 glass-card p-6 sm:p-8 rounded-3xl border border-violet-500/30 bg-gradient-to-b from-[#181932] to-[#101121] shadow-2xl flex flex-col justify-between space-y-4 overflow-y-auto">
          {/* Back Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{
                  backgroundColor: `${card.subjectColor}20`,
                  color: card.subjectColor,
                }}
              >
                {card.subjectCode}
              </span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Answer & Model Proof
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="p-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 text-xs flex items-center gap-1"
            >
              <RotateCw className="w-3 h-3" /> Flip back
            </button>
          </div>

          {/* Back Body: Answer, Formula, Code, Exam Tip */}
          <div className="flex-1 space-y-3 py-1">
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line font-medium">
              {card.answer}
            </p>

            {/* Formula Block */}
            {card.formula && (
              <div className="p-2.5 rounded-xl bg-black/40 border border-cyan-500/30 text-xs font-mono text-cyan-300">
                <span className="text-[10px] text-cyan-400 font-bold block mb-0.5">Key Formula:</span>
                {card.formula}
              </div>
            )}

            {/* Code Snippet */}
            {card.codeSnippet && (
              <pre className="p-3 rounded-xl bg-[#090A14] border border-white/[0.08] text-xs font-mono text-violet-300 overflow-x-auto">
                {card.codeSnippet}
              </pre>
            )}

            {/* Exam Tip */}
            {card.examTip && (
              <div className="p-3 rounded-xl bg-violet-600/10 border border-violet-500/20 text-xs text-violet-200 flex items-start gap-2">
                <Zap className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-violet-300">Exam Marking Tip: </span>
                  {card.examTip}
                </div>
              </div>
            )}
          </div>

          {/* Back Footer: SM-2 Spaced Repetition Rating Buttons */}
          <div className="pt-3 border-t border-white/[0.08] space-y-2">
            <p className="text-[11px] text-center text-slate-400 font-medium">
              How well did you know this concept? (SM-2 Spaced Repetition)
            </p>

            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={(e) => handleRate(e, "again")}
                className="py-2 px-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center transition-all hover:scale-[1.02]"
              >
                <span className="block text-[10px] text-rose-400/80">&lt; 10 min</span>
                <span>Again</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleRate(e, "hard")}
                className="py-2 px-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold text-center transition-all hover:scale-[1.02]"
              >
                <span className="block text-[10px] text-amber-400/80">1 Day</span>
                <span>Hard</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleRate(e, "good")}
                className="py-2 px-1 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold text-center transition-all hover:scale-[1.02]"
              >
                <span className="block text-[10px] text-indigo-400/80">3 Days</span>
                <span>Good</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleRate(e, "easy")}
                className="py-2 px-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold text-center transition-all hover:scale-[1.02]"
              >
                <span className="block text-[10px] text-emerald-400/80">7 Days</span>
                <span>Easy</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
