"use client";

import React from "react";
import { Cpu, Sparkles, Sliders, CheckCircle2 } from "lucide-react";
import { MOCK_USER } from "@/lib/mock-data";

export default function AiManagerPage() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-3xl border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Engine & Model Manager</h1>
            <p className="text-sm text-slate-400">
              Configure LLM endpoints, temperature, syllabus retrieval prompts, and token quotas
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6 rounded-2xl border border-white/[0.08] space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            Active LLM Providers
          </h2>
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] flex justify-between items-center">
              <span>Claude 3.7 Sonnet (Reasoning & Code)</span>
              <span className="text-emerald-400 font-semibold">Enabled</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] flex justify-between items-center">
              <span>GPT-4o (Quick Explanations & Quiz Gen)</span>
              <span className="text-emerald-400 font-semibold">Enabled</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/[0.08] space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Quota & Token Usage
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Used Tokens</span>
              <span className="font-mono">
                {MOCK_USER.aiTokensUsed.toLocaleString()} / {MOCK_USER.aiTokensTotal.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                style={{
                  width: `${(MOCK_USER.aiTokensUsed / MOCK_USER.aiTokensTotal) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
