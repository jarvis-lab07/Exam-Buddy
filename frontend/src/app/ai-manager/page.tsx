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
  AlertTriangle,
  FileText,
  RotateCcw,
  Check,
  Eye,
  Wrench,
  Layers,
  ArrowRightLeft,
  Trash2,
  Search,
} from "lucide-react";
import {
  AI_PROVIDERS,
  type AIProvider,
  getActiveProvider,
  setActiveProvider,
  getStoredApiKeys,
  getAllStoredKeys,
  fetchOllamaModels,
} from "@/lib/ai-service";
import { getModelRegistry, toggleModelStatus, saveModelRegistry } from "@/lib/ai-gateway/model-registry";
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
  const [activeTab, setActiveTab] = useState<"providers" | "registry" | "routing" | "logs">("providers");

  // Providers & Keys State
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
  const [healthStatus, setHealthStatus] = useState<Record<AIProvider, "ok" | "checking" | "error" | "unconfigured">>({
    gemini: "ok",
    groq: "ok",
    openai: "unconfigured",
    ollama: "unconfigured",
    anthropic: "unconfigured",
  });

  // Model Registry State
  const [models, setModels] = useState<ModelMetadata[]>([]);
  const [modelSearch, setModelSearch] = useState("");

  // Feature Routing State
  const [policies, setPolicies] = useState<FeatureRoutingPolicy[]>([]);
  const [routingMode, setRoutingModeState] = useState<RoutingMode>("feature_policy");

  // Logs & Analytics State
  const [logs, setLogs] = useState<AIRequestLog[]>([]);
  const [analytics, setAnalytics] = useState(getAIAnalyticsSummary());

  const loadData = async () => {
    // 1. Providers
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

    // 2. Registry
    setModels(getModelRegistry());

    // 3. Routing
    setPolicies(getFeaturePolicies());
    setRoutingModeState(getRoutingMode());

    // 4. Logs
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

  const handleToggleModel = (modelId: string) => {
    const updated = toggleModelStatus(modelId);
    setModels(updated);
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

  const filteredModels = models.filter(
    (m) =>
      m.displayName.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.provider.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.id.toLowerCase().includes(modelSearch.toLowerCase())
  );

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
              AI Management & Router Gateway
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Dyad AI Architecture
              </span>
            </h1>
            <p className="text-sm text-[#9B99B5]">
              Centralized AI Gateway managing providers, model registry, intelligent routing, stream fallbacks, and request telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-bold flex items-center gap-1.5 border border-white/[0.08] transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Config
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-white/[0.08]">
          <div className="text-[11px] font-semibold text-[#9B99B5] uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-indigo-400" /> Total AI Requests
          </div>
          <div className="text-2xl font-black text-white mt-1">{analytics.totalRequests}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Success Rate: {analytics.successRatePercent}%</div>
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
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" /> Backup Fallbacks
          </div>
          <div className="text-2xl font-black text-cyan-300 mt-1">{analytics.fallbackCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Auto-routed backup triggers</div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-white/[0.08]">
          <div className="text-[11px] font-semibold text-[#9B99B5] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Tokens Consumed
          </div>
          <div className="text-2xl font-black text-violet-300 mt-1">
            {Math.round(analytics.totalTokensUsed / 1000)}k
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Prompt + Completion tokens</div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1 overflow-x-auto no-scrollbar">
        {[
          { id: "providers", label: "Providers & API Keys", icon: Key },
          { id: "registry", label: `Model Registry (${models.filter((m) => m.enabled).length}/${models.length})`, icon: Layers },
          { id: "routing", label: "Feature Model Routing", icon: Sliders },
          { id: "logs", label: `Developer Logs & Telemetry (${logs.length})`, icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0",
                isActive
                  ? "bg-violet-600/20 text-violet-200 border border-violet-500/40 shadow-md"
                  : "text-[#9B99B5] hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <Icon className="w-4 h-4 text-violet-400" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROVIDERS & API KEYS */}
      {activeTab === "providers" && (
        <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(AI_PROVIDERS).map((prov) => {
              const isSelected = activeProvider === prov.id;
              const hasKey = keyCounts[prov.id] > 0 || (prov.id === "ollama" && keys.ollama);
              const isFree = prov.id === "gemini" || prov.id === "groq" || prov.id === "ollama";

              return (
                <div
                  key={prov.id}
                  className={cn(
                    "glass-card p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4",
                    isSelected
                      ? "border-violet-500/50 bg-violet-500/[0.04] ring-1 ring-violet-500/30"
                      : "border-white/[0.08] hover:border-white/[0.15]"
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-violet-500/15 text-violet-300 border border-violet-500/30">
                          {prov.id === "gemini" ? <Sparkles className="w-5 h-5 text-amber-400" /> : prov.id === "groq" ? <Zap className="w-5 h-5 text-cyan-400" /> : prov.id === "ollama" ? <HardDrive className="w-5 h-5 text-purple-400" /> : <Cpu className="w-5 h-5 text-indigo-400" />}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                            {prov.name}
                            {isFree && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                FREE TIER
                              </span>
                            )}
                          </h3>
                          <p className="text-[11px] text-[#9B99B5]">{prov.tagline}</p>
                        </div>
                      </div>
                    </div>

                    {/* Feature Capability Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.06] flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 text-amber-400" /> Streaming
                      </span>
                      {prov.id === "gemini" || prov.id === "openai" ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.06] flex items-center gap-1">
                          <Eye className="w-2.5 h-2.5 text-cyan-400" /> Vision
                        </span>
                      ) : null}
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.06] flex items-center gap-1">
                        <Wrench className="w-2.5 h-2.5 text-violet-400" /> Tools
                      </span>
                    </div>

                    {/* Connection Status */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.04]">
                      <span className="text-[#9B99B5]">Key Status:</span>
                      {hasKey ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Configured ({keyCounts[prov.id]} keys)
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Key Missing
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(prov.id)}
                      className="flex-1 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-white/[0.08] transition-all"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      Configure Key
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectActiveProvider(prov.id)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0",
                        isSelected
                          ? "bg-violet-600 text-white"
                          : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                      )}
                    >
                      {isSelected ? "Default" : "Set Default"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MODEL REGISTRY */}
      {activeTab === "registry" && (
        <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#9B99B5]" />
              <input
                type="text"
                placeholder="Search models by name, provider, or ID..."
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#13131F] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50"
              />
            </div>
            <div className="text-xs text-[#9B99B5]">
              Showing {filteredModels.length} of {models.length} models
            </div>
          </div>

          <div className="space-y-2">
            {filteredModels.map((model) => (
              <div
                key={model.id}
                className={cn(
                  "glass-card p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                  model.enabled
                    ? "border-white/[0.08] bg-white/[0.02]"
                    : "border-white/[0.04] opacity-50 bg-black/20"
                )}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">{model.displayName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/25">
                      {model.id}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#9B99B5] px-1.5 py-0.5 rounded bg-white/[0.04]">
                      {model.provider}
                    </span>
                  </div>
                  {model.notes && <p className="text-[11px] text-[#9B99B5] truncate">{model.notes}</p>}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-2 text-[10px] text-[#9B99B5]">
                    <span>Context: {(model.contextWindow / 1000).toFixed(0)}k</span>
                    <span>Max Out: {model.maxOutputTokens}</span>
                    {model.visionSupport && <span className="text-cyan-300 font-bold">👁 Vision</span>}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleModel(model.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                      model.enabled
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-white/[0.04] text-slate-400 border border-white/[0.08]"
                    )}
                  >
                    {model.enabled ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Enabled
                      </>
                    ) : (
                      "Disabled"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FEATURE MODEL ROUTING */}
      {activeTab === "routing" && (
        <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
          {/* Routing Mode Bar */}
          <div className="glass-card p-4 rounded-2xl border border-white/[0.08] flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-sm font-bold text-white">Intelligent Router Mode</h3>
              <p className="text-[11px] text-[#9B99B5]">Select how Exam Buddy resolves models across features.</p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-[#13131F] rounded-xl border border-white/[0.08]">
              {[
                { id: "feature_policy", label: "Feature Policy (Recommended)" },
                { id: "auto", label: "Auto Smart Router" },
                { id: "manual", label: "Manual User Override" },
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

          {/* Feature Policy Rows */}
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
                    Configured primary model and backup fallback model for this feature.
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Primary Model Select */}
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

                  {/* Fallback Model Select */}
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

      {/* TAB 4: DEVELOPER LOGS & TELEMETRY */}
      {activeTab === "logs" && (
        <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-violet-400" />
                Real-Time AI Request Telemetry
              </h3>
              <p className="text-[11px] text-[#9B99B5]">Inspect latency, TTFT, token usage, and fallback logs.</p>
            </div>
            {logs.length > 0 && (
              <button
                type="button"
                onClick={handleClearLogs}
                className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold flex items-center gap-1.5 border border-rose-500/30 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Logs
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <div className="glass-card p-12 rounded-2xl border border-white/[0.08] text-center text-[#5A5875]">
              <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50 text-violet-400" />
              <p className="text-xs font-semibold">No AI Gateway request logs recorded yet.</p>
              <p className="text-[11px] mt-1 opacity-70">
                Trigger an AI chat, lecture tutor, or note generation to see live telemetry!
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
        onClose={() => setIsKeyModalOpen(false)}
        initialProvider={modalProvider}
        onKeysUpdated={loadData}
      />
    </div>
  );
}
