"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Sparkles,
  Sliders,
  CheckCircle2,
  Key,
  Zap,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Clock,
} from "lucide-react";
import { MOCK_USER } from "@/lib/mock-data";
import {
  AI_PROVIDERS,
  type AIProvider,
  getActiveProvider,
  setActiveProvider,
  getStoredApiKey,
  getAllStoredKeys,
} from "@/lib/ai-service";
import { ApiKeyModal } from "@/components/ai/ApiKeyModal";

export default function AiManagerPage() {
  const [activeProvider, setActiveProviderState] = useState<AIProvider>("gemini");
  const [keys, setKeys] = useState<Record<AIProvider, string>>({
    gemini: "",
    groq: "",
    openai: "",
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  const loadData = () => {
    const prov = getActiveProvider();
    setActiveProviderState(prov);
    const stored = getAllStoredKeys();
    setKeys({
      gemini: stored.gemini || "",
      groq: stored.groq || "",
      openai: stored.openai || "",
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectActiveProvider = (prov: AIProvider) => {
    setActiveProvider(prov);
    setActiveProviderState(prov);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-3xl border border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              AI Engine & BYOK Router
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                Client-Side BYOK
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Configure your personal AI keys for Google Gemini, Groq, and OpenAI. Keys stay
              100% in your browser.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsKeyModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-violet-600/30 transition-all"
        >
          <Key className="w-4 h-4 text-amber-300" />
          <span>Manage All API Keys</span>
        </button>
      </div>

      {/* Provider Selection Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          Select Default AI Provider for Universal Search & Chat
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((prov) => {
            const meta = AI_PROVIDERS[prov];
            const isSelected = activeProvider === prov;
            const hasKey = Boolean(keys[prov]);

            return (
              <div
                key={prov}
                onClick={() => handleSelectActiveProvider(prov)}
                className={`glass-card p-5 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? "border-violet-500/50 bg-violet-600/[0.08] shadow-xl shadow-violet-600/10 ring-1 ring-violet-500/30"
                    : "border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02]"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {prov === "gemini" && (
                        <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                          <Sparkles className="w-4 h-4" />
                        </div>
                      )}
                      {prov === "groq" && (
                        <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
                          <Zap className="w-4 h-4" />
                        </div>
                      )}
                      {prov === "openai" && (
                        <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                          <Cpu className="w-4 h-4" />
                        </div>
                      )}
                      <span className="font-bold text-white text-sm">{meta.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {hasKey ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Ready
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          No Key
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{meta.tagline}</p>

                  <div className="text-[11px] font-mono text-slate-500 bg-black/30 p-2 rounded-xl border border-white/[0.04]">
                    Model: {meta.defaultModel}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    {isSelected ? "Currently Active" : "Click to activate"}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsKeyModalOpen(true);
                    }}
                    className="text-violet-400 hover:text-violet-300 font-medium hover:underline flex items-center gap-1"
                  >
                    <span>{hasKey ? "Edit Key" : "Add Key"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quota & Security Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Token Usage Card */}
        <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Monthly AI Usage Meter
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Used Tokens (Academic Session)</span>
              <span className="font-mono text-cyan-300 font-semibold">
                {MOCK_USER.aiTokensUsed.toLocaleString()} /{" "}
                {MOCK_USER.aiTokensTotal.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 transition-all duration-500"
                style={{
                  width: `${(MOCK_USER.aiTokensUsed / MOCK_USER.aiTokensTotal) * 100}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              With your own API keys (BYOK), you bypass platform token limits and get direct,
              unthrottled model access.
            </p>
          </div>
        </div>

        {/* BYOK Security Guarantee */}
        <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Privacy & BYOK Architecture
          </h2>
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1">
              <p className="font-semibold text-white">🔒 Zero Server Storage</p>
              <p className="text-slate-400 text-[11px]">
                Your API keys are stored exclusively in your browser’s secure `localStorage`. They are
                never sent to our database or logged anywhere.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1">
              <p className="font-semibold text-white">⚡ Free Google AI Studio Tier</p>
              <p className="text-slate-400 text-[11px]">
                Google AI Studio provides a free-tier Gemini API key with up to 15 requests per
                minute, ample for exam study sessions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeysUpdated={loadData}
      />
    </div>
  );
}
