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
  Activity,
  ArrowRightLeft,
  Trash2,
  Search,
  Check,
  Eye,
  Wrench,
  Layers,
  AlertTriangle,
  Bot,
} from "lucide-react";
import {
  AI_PROVIDERS,
  type AIProvider,
  getActiveProvider,
  setActiveProvider,
  getStoredApiKeys,
  getAllStoredKeys,
  getOllamaEndpoint,
  fetchOllamaModels,
  getSelectedModel,
} from "@/lib/ai-service";
import { getModelRegistry, toggleModelStatus } from "@/lib/ai-gateway/model-registry";
import {
  getFeaturePolicies,
  saveFeaturePolicies,
  getRoutingMode,
  setRoutingMode,
} from "@/lib/ai-gateway/feature-router";
import {
  getAIRequestLogs,
  getAIAnalyticsSummary,
  clearAIRequestLogs,
} from "@/lib/ai-gateway/logger";
import { ModelMetadata, FeatureRoutingPolicy, RoutingMode, AIRequestLog } from "@/lib/ai-gateway/types";
import { ApiKeyModal } from "@/components/ai/ApiKeyModal";
import { cn } from "@/lib/utils";

export default function AiManagerPage() {
  // View mode switcher: "engine" (Previous Exam Buddy UI) | "router" (Dyad Feature Policies) | "logs" (Dyad Telemetry)
  const [activeSubTab, setActiveSubTab] = useState<"engine" | "router" | "logs">("engine");

  const [activeProvider, setActiveProviderState] = useState<AIProvider>("gemini");
  const [keys, setKeys] = useState<Record<AIProvider, string>>({
    gemini: "",
    groq: "",
    openai: "",
    ollama: "",
    anthropic: "",
  });
  const [keyCounts, setKeyCounts] = useState<Record<AIProvider, number>>({
    gemini: 0,
    groq: 0,
    openai: 0,
    ollama: 0,
    anthropic: 0,
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [modalProvider, setModalProvider] = useState<AIProvider>("gemini");
  const [ollamaModels, setOllamaModels] = useState<{ name: string; sizeMb?: number }[]>([]);
  const [isCheckingOllama, setIsCheckingOllama] = useState(false);

  // Dyad Gateway Essentials
  const [models, setModels] = useState<ModelMetadata[]>([]);
  const [policies, setPolicies] = useState<FeatureRoutingPolicy[]>([]);
  const [routingMode, setRoutingModeState] = useState<RoutingMode>("feature_policy");
  const [logs, setLogs] = useState<AIRequestLog[]>([]);
  const [analytics, setAnalytics] = useState(getAIAnalyticsSummary());

  const loadData = async () => {
    const prov = getActiveProvider();
    setActiveProviderState(prov);
    const stored = getAllStoredKeys();
    setKeys({
      gemini: stored.gemini || "",
      groq: stored.groq || "",
      openai: stored.openai || "",
      ollama: stored.ollama || "http://localhost:11434",
      anthropic: (stored as any).anthropic || "",
    });

    setKeyCounts({
      gemini: getStoredApiKeys("gemini").length,
      groq: getStoredApiKeys("groq").length,
      openai: getStoredApiKeys("openai").length,
      ollama: stored.ollama ? 1 : 0,
      anthropic: getStoredApiKeys("anthropic" as any).length,
    });

    // Check Ollama models
    setIsCheckingOllama(true);
    const ollamaRes = await fetchOllamaModels();
    setIsCheckingOllama(false);
    if (ollamaRes.success) {
      setOllamaModels(ollamaRes.models);
    }

    // Dyad Gateway Essentials Data
    setModels(getModelRegistry());
    setPolicies(getFeaturePolicies());
    setRoutingModeState(getRoutingMode());
    setLogs(getAIRequestLogs());
    setAnalytics(getAIAnalyticsSummary());
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

  const handleUpdatePolicy = (featureKey: string, field: "primaryModelId" | "fallbackModelId" | "autoRoutingEnabled", value: any) => {
    const updated = policies.map((p) =>
      p.featureKey === featureKey ? { ...p, [field]: value } : p
    );
    setPolicies(updated);
    saveFeaturePolicies(updated);
  };

  const handleRoutingModeChange = (mode: RoutingMode) => {
    setRoutingModeState(mode);
    setRoutingMode(mode);
  };

  const handleClearLogs = () => {
    clearAIRequestLogs();
    setLogs([]);
    setAnalytics(getAIAnalyticsSummary());
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-2xl border border-white/[0.08] border-t-2 border-violet-500/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              AI Engine & Gateway Management
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                BYOK + Dyad AI Gateway
              </span>
            </h1>
            <p className="text-sm text-[#9B99B5]">
              Manage API keys, select default providers, and configure automatic fallback model routing across Exam Buddy.
            </p>
          </div>
        </div>

        {/* View Switcher: Engine & Keys (Original Exam Buddy) | Router Policies | Telemetry Logs */}
        <div className="flex items-center gap-1 p-1 bg-[#13131F] rounded-xl border border-white/[0.08]">
          <button
            type="button"
            onClick={() => setActiveSubTab("engine")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
              activeSubTab === "engine"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-[#9B99B5] hover:text-white"
            )}
          >
            <Key className="w-3.5 h-3.5" />
            Providers & Keys
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("router")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
              activeSubTab === "router"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-[#9B99B5] hover:text-white"
            )}
          >
            <Sliders className="w-3.5 h-3.5" />
            Dyad Router
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("logs")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
              activeSubTab === "logs"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-[#9B99B5] hover:text-white"
            )}
          >
            <Terminal className="w-3.5 h-3.5" />
            Telemetry ({logs.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: PREVIOUS EXAM BUDDY PROVIDER GRID (ENHANCED WITH BYOK KEYS) */}
      {activeSubTab === "engine" && (
        <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
          {/* Active Provider Banner */}
          <div className="glass-card p-5 rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B99B5]">
                Current Active AI Engine
              </span>
              <div className="flex items-center gap-2 mt-1">
                <h2 className="text-xl font-black text-white">
                  {AI_PROVIDERS[activeProvider]?.name || activeProvider}
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Default Model: <code className="text-violet-300 font-mono">{getSelectedModel(activeProvider)}</code>
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenModal(activeProvider)}
              className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md self-start sm:self-auto"
            >
              <Key className="w-4 h-4" />
              <span>Manage {AI_PROVIDERS[activeProvider]?.name.split(" ")[0]} Keys</span>
            </button>
          </div>

          {/* Provider Selection Cards */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-violet-400" />
              Available AI Providers
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(AI_PROVIDERS).map((provKey) => {
                const prov = provKey as AIProvider;
                const meta = AI_PROVIDERS[prov];
                const isSelected = activeProvider === prov;
                const count = keyCounts[prov];
                const hasKey = count > 0 || (prov === "ollama" && keys.ollama);
                const isOllama = prov === "ollama";
                const currentModel = getSelectedModel(prov);

                return (
                  <div
                    key={prov}
                    onClick={() => handleSelectActiveProvider(prov)}
                    className={cn(
                      "glass-card p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 group",
                      isSelected
                        ? "border-violet-500/60 bg-violet-500/[0.05] ring-1 ring-violet-500/30"
                        : "border-white/[0.08] hover:border-white/[0.15]"
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
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
                          {prov === "anthropic" && (
                            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                              <Bot className="w-4 h-4" />
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

          {/* Local Ollama Status & Privacy Guarantee Cards */}
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

            {/* Privacy & BYOK Encryption Guarantee */}
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
                    Cloud keys for Gemini, Groq, OpenAI, and Anthropic are stored in your browser’s local storage. No central database logging.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DYAD FEATURE MODEL ROUTER */}
      {activeSubTab === "router" && (
        <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="glass-card p-4 rounded-2xl border border-white/[0.08] flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-violet-400" />
                Dyad Intelligent Router Mode
              </h3>
              <p className="text-[11px] text-[#9B99B5]">
                Configure Primary vs Backup Fallback AI models for each feature inside Exam Buddy.
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-[#13131F] rounded-xl border border-white/[0.08]">
              {[
                { id: "feature_policy", label: "Feature Policy (Recommended)" },
                { id: "auto", label: "Auto Smart Router" },
                { id: "manual", label: "Manual Override" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleRoutingModeChange(m.id as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    routingMode === m.id
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-[#9B99B5] hover:text-white"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {policies.map((policy) => (
              <div
                key={policy.featureKey}
                className="glass-card p-5 rounded-2xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {policy.featureName}
                    <span className="text-[10px] font-mono text-violet-300 px-2 py-0.5 rounded bg-violet-500/15 border border-violet-500/25">
                      {policy.featureKey}
                    </span>
                  </h4>
                  <p className="text-[11px] text-[#9B99B5] mt-0.5">
                    Primary model handles requests. Backup model is auto-triggered if primary fails or rate-limits.
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#9B99B5] uppercase mb-1">
                      Primary Model
                    </label>
                    <select
                      value={policy.primaryModelId}
                      onChange={(e) => handleUpdatePolicy(policy.featureKey, "primaryModelId", e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-[#13131F] border border-white/[0.1] text-white text-xs font-medium focus:outline-none focus:border-violet-500"
                    >
                      {models
                        .filter((m) => m.enabled)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.displayName} ({m.provider})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-cyan-300 uppercase mb-1">
                      Backup Fallback
                    </label>
                    <select
                      value={policy.fallbackModelId}
                      onChange={(e) => handleUpdatePolicy(policy.featureKey, "fallbackModelId", e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-[#13131F] border border-white/[0.1] text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                    >
                      {models
                        .filter((m) => m.enabled)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.displayName} ({m.provider})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: DYAD TELEMETRY & LOGS */}
      {activeSubTab === "logs" && (
        <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-xl border border-white/[0.08]">
              <div className="text-[11px] font-semibold text-[#9B99B5] uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-indigo-400" /> Total AI Requests
              </div>
              <div className="text-2xl font-black text-white mt-1">{analytics.totalRequests}</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Success: {analytics.successRatePercent}%</div>
            </div>

            <div className="glass-card p-4 rounded-xl border border-white/[0.08]">
              <div className="text-[11px] font-semibold text-[#9B99B5] uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Avg First Token (TTFT)
              </div>
              <div className="text-2xl font-black text-white mt-1">
                {analytics.avgTTFTMs > 0 ? `${analytics.avgTTFTMs}ms` : "—"}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Latency: {analytics.avgLatencyMs}ms</div>
            </div>

            <div className="glass-card p-4 rounded-xl border border-white/[0.08]">
              <div className="text-[11px] font-semibold text-[#9B99B5] uppercase tracking-wider flex items-center gap-1">
                <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" /> Fallbacks Triggered
              </div>
              <div className="text-2xl font-black text-cyan-300 mt-1">{analytics.fallbackCount}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Backup auto-switches</div>
            </div>

            <div className="glass-card p-4 rounded-xl border border-white/[0.08]">
              <div className="text-[11px] font-semibold text-[#9B99B5] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Tokens Consumed
              </div>
              <div className="text-2xl font-black text-violet-300 mt-1">
                {Math.round(analytics.totalTokensUsed / 1000)}k
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Total prompt & completion</div>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 pt-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-violet-400" />
              Request Telemetry Log Stream
            </h3>
            {logs.length > 0 && (
              <button
                type="button"
                onClick={handleClearLogs}
                className="px-3 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold border border-rose-500/30 transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <div className="glass-card p-10 rounded-2xl border border-white/[0.08] text-center text-[#5A5875]">
              <Terminal className="w-7 h-7 mx-auto mb-2 opacity-50 text-violet-400" />
              <p className="text-xs font-semibold">No AI Gateway request logs recorded yet.</p>
              <p className="text-[11px] mt-1 opacity-70">
                Interact with AI Tutor Chat or YouTube Study Workspace to see live telemetry!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0A0A14]">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.04] text-[#9B99B5] font-semibold border-b border-white/[0.06]">
                  <tr>
                    <th className="p-3">Request ID</th>
                    <th className="p-3">Feature</th>
                    <th className="p-3">Provider & Model</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Latency</th>
                    <th className="p-3">TTFT</th>
                    <th className="p-3">Tokens</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02]">
                      <td className="p-3 font-mono text-[11px] text-violet-300">{log.requestId}</td>
                      <td className="p-3 font-bold text-white">{log.feature}</td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-200">{log.model}</span>
                        <span className="text-[10px] block text-[#9B99B5] uppercase">{log.provider}</span>
                      </td>
                      <td className="p-3">
                        {log.status === "success" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                            Success
                          </span>
                        )}
                        {log.status === "fallback_success" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                            Backup Fallback
                          </span>
                        )}
                        {log.status === "error" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/25">
                            {log.errorCategory || "Error"}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-300">{log.latencyMs}ms</td>
                      <td className="p-3 font-mono text-amber-300">
                        {log.ttftMs ? `${log.ttftMs}ms` : "—"}
                      </td>
                      <td className="p-3 font-mono text-slate-300">{log.totalTokens}</td>
                      <td className="p-3 text-[10px] text-[#9B99B5]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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
