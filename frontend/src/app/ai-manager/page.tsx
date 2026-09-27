"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Sparkles,
  Sliders,
  CheckCircle2,
  Key,
  Zap,
  HardDrive,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Clock,
  Terminal,
} from "lucide-react";
import { MOCK_USER } from "@/lib/mock-data";
import {
  AI_PROVIDERS,
  type AIProvider,
  getActiveProvider,
  setActiveProvider,
  getStoredApiKey,
  getStoredApiKeys,
  getAllStoredKeys,
  getOllamaEndpoint,
  getOllamaModel,
  fetchOllamaModels,
  getSelectedModel,
} from "@/lib/ai-service";
import { ApiKeyModal } from "@/components/ai/ApiKeyModal";

export default function AiManagerPage() {
  const [activeProvider, setActiveProviderState] = useState<AIProvider>("gemini");
  const [keys, setKeys] = useState<Record<AIProvider, string>>({
    gemini: "",
    groq: "",
    openai: "",
    ollama: "",
  });
  const [keyCounts, setKeyCounts] = useState<Record<AIProvider, number>>({
    gemini: 0,
    groq: 0,
    openai: 0,
    ollama: 0,
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [modalProvider, setModalProvider] = useState<AIProvider>("gemini");
  const [ollamaModels, setOllamaModels] = useState<{ name: string; sizeMb?: number }[]>([]);
  const [isCheckingOllama, setIsCheckingOllama] = useState(false);

  const loadData = async () => {
    const prov = getActiveProvider();
    setActiveProviderState(prov);
    const stored = getAllStoredKeys();
    setKeys({
      gemini: stored.gemini || "",
      groq: stored.groq || "",
      openai: stored.openai || "",
      ollama: stored.ollama || "http://localhost:11434",
    });

    setKeyCounts({
      gemini: getStoredApiKeys("gemini").length,
      groq: getStoredApiKeys("groq").length,
      openai: getStoredApiKeys("openai").length,
      ollama: stored.ollama ? 1 : 0,
    });

    // Check Ollama models
    setIsCheckingOllama(true);
    const ollamaRes = await fetchOllamaModels();
    setIsCheckingOllama(false);
    if (ollamaRes.success) {
      setOllamaModels(ollamaRes.models);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectActiveProvider = (prov: AIProvider) => {
    setActiveProvider(prov);
    setActiveProviderState(prov);
  };

  const handleOpenModal = (prov: AIProvider) => {
    setModalProvider(prov);
    setIsKeyModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-2xl border border-white/[0.08] border-t-2 border-violet-500/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              AI Engine & Model Manager
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                BYOK & Local AI
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Configure cloud keys (Google Gemini, Groq, OpenAI) or connect your local Ollama instance for 100% offline study sessions.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal(activeProvider)}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <Key className="w-4 h-4 text-amber-300" />
          <span>Configure API & Keys</span>
        </button>
      </div>

      {/* 3-Step Setup Guide Banner */}
      <div className="glass-card p-5 rounded-2xl border border-violet-500/20 border-t-2 border-violet-500/35 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h2 className="text-sm font-bold text-white">How Zero-Friction AI Key Setup Works</h2>
          </div>
          <span className="text-[11px] text-violet-300 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20 font-medium">
            No technical knowledge needed!
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">1</span>
              <span>Click "Get API Key"</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Click the link on any provider card to open their official API key page in a new tab.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px]">2</span>
              <span>Paste Key & Auto-Model Setup</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Paste your key. Exam-Buddy automatically configures the best working model for you!
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
              <span>Add 2+ Keys to Bypass Limits</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              If rate limits hit, create another key from the same site and add it. We automatically rotate keys!
            </p>
          </div>
        </div>
      </div>

      {/* Provider Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            AI Providers & Active Models
          </h2>
          <span className="text-xs text-slate-400">Click a card to set as Active Engine</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((prov) => {
            const meta = AI_PROVIDERS[prov];
            const isSelected = activeProvider === prov;
            const isOllama = prov === "ollama";
            const count = keyCounts[prov];
            const hasKey = count > 0;
            const currentModel = getSelectedModel(prov);

            return (
              <div
                key={prov}
                onClick={() => handleSelectActiveProvider(prov)}
                className={`glass-card p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? "border-violet-500/50 bg-violet-600/[0.08]"
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
                      {prov === "ollama" && (
                        <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
                          <HardDrive className="w-4 h-4" />
                        </div>
                      )}
                      {prov === "groq" && (
                        <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                          <Zap className="w-4 h-4" />
                        </div>
                      )}
                      {prov === "openai" && (
                        <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                          <Cpu className="w-4 h-4" />
                        </div>
                      )}
                      <span className="font-bold text-white text-sm">{meta.name.split(" ")[0]}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isOllama ? (
                        ollamaModels.length > 0 ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                            {ollamaModels.length} Models
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-white/[0.05]">
                            Local
                          </span>
                        )
                      ) : hasKey ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                          {count > 1 ? `${count} Keys` : "Ready"}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          No Key
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{meta.tagline}</p>

                  <div className="text-[11px] font-mono text-slate-300 bg-black/30 p-2 rounded-xl border border-white/[0.04] truncate">
                    <span className="text-slate-500">Model:</span> {currentModel}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] space-y-2">
                  {!isOllama && (
                    <a
                      href={meta.getApiKeyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-full py-1.5 px-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-amber-300 hover:text-amber-200 text-[11px] font-semibold flex items-center justify-center gap-1 border border-white/[0.08] transition-colors"
                    >
                      <span>Get {meta.name.split(" ")[0]} API Key</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      {isSelected ? "🟢 Active Engine" : "Click to select"}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(prov);
                      }}
                      className="text-violet-400 hover:text-violet-300 font-medium hover:underline flex items-center gap-1"
                    >
                      <span>{isOllama ? "Setup" : hasKey ? `Manage (${count})` : "+ Add Key"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Local Ollama Status & Quota Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Local Ollama Environment Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              Local Ollama Environment
            </h2>
            <button
              type="button"
              onClick={loadData}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingOllama ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs">
              <span className="text-slate-400">Endpoint:</span>
              <span className="font-mono text-slate-200">{getOllamaEndpoint()}</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Installed Local Models:</span>
                <span className="text-cyan-300 font-semibold">{ollamaModels.length} detected</span>
              </div>
              {ollamaModels.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ollamaModels.map((m) => (
                    <span
                      key={m.name}
                      className="px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-[11px]"
                    >
                      {m.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Ollama not detected or no models pulled yet. Run <code className="text-cyan-300">ollama run llama3.2</code> in your terminal.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Security & Token Guarantee */}
        <div className="glass-card p-6 rounded-2xl border border-white/[0.08] space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            100% Privacy Guarantee
          </h2>
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1">
              <p className="font-semibold text-white">🔒 Zero External Traffic with Ollama</p>
              <p className="text-slate-400 text-[11px]">
                When Ollama is selected, your notes, exam questions, and chat history never leave your computer. 100% processed on your local GPU/CPU.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1">
              <p className="font-semibold text-white">⚡ BYOK Cloud Encryption</p>
              <p className="text-slate-400 text-[11px]">
                Cloud keys for Gemini, Groq, and OpenAI are stored in your browser’s local storage. No central database logging.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        initialProvider={modalProvider}
        onClose={() => setIsKeyModalOpen(false)}
        onKeysUpdated={loadData}
      />
    </div>
  );
}
