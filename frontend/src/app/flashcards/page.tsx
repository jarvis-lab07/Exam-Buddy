"use client";

import React from "react";
import { Layers, Sparkles, Check, RotateCw } from "lucide-react";

export default function FlashcardsPage() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-3xl border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Smart Flashcards Deck</h1>
            <p className="text-sm text-slate-400">
              Active recall cards automatically generated from your syllabus and uploaded slides
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto glass-card p-8 rounded-3xl border border-white/[0.1] text-center space-y-6 min-h-[300px] flex flex-col justify-between">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>Card 1 of 24</span>
          <span className="text-indigo-400 font-semibold">Data Structures (CS301)</span>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-mono">Question</p>
          <p className="text-lg font-bold text-white leading-relaxed">
            What is the maximum height of a Red-Black Tree containing <code className="text-cyan-300">n</code> internal nodes?
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-xs font-semibold text-slate-300 flex items-center gap-2">
            <RotateCw className="w-3.5 h-3.5" /> Reveal Answer
          </button>
        </div>
      </div>
    </div>
  );
}
