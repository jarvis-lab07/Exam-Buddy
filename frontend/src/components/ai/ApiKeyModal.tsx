"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  Trash2,
  Plus,
  Cpu,
  Zap,
  HardDrive,
  Terminal,
  RefreshCw,
} from "lucide-react";
import {
  AI_PROVIDERS,
  type AIProvider,
  getStoredApiKey,
  saveApiKey,
  getStoredApiKeys,
  saveApiKeys,
  validateApiKey,
  getActiveProvider,
  setActiveProvider,
  getAllStoredKeys,
  getOllamaEndpoint,
  saveOllamaEndpoint,
  getOllamaModel,
  saveOllamaModel,
  fetchOllamaModels,
  getSelectedModel,
  saveSelectedModel,
} from "@/lib/ai-service";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeysUpdated?: () => void;
  initialProvider?: AIProvider;
}

export function ApiKeyModal({ isOpen, onClose, onKeysUpdated, initialProvider }: ApiKeyModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>("gemini");
  const [currentKey, setCurrentKey] = useState<string>("");
  const [multiKeys, setMultiKeys] = useState<string[]>([]);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{
    status: "idle" | "success" | "error";
    message?: string;
  }>({ status: "idle" });
  const [activeProvider, setActiveProviderState] = useState<AIProvider>("gemini");
  const [hasKeys, setHasKeys] = useState<Record<AIProvider, boolean>>({
    gemini: false,
    groq: false,
    openai: false,
    ollama: false,
  });

  // Ollama specific state
  const [ollamaEndpoint, setOllamaEndpointState] = useState<string>("http://localhost:11434");
  const [ollamaModel, setOllamaModelState] = useState<string>("llama3.2");
  const [ollamaModelsList, setOllamaModelsList] = useState<{ name: string; sizeMb?: number }[]>([]);
  const [isDetectingOllama, setIsDetectingOllama] = useState<boolean>(false);

  // Cloud provider model selection
  const [cloudModel, setCloudModel] = useState<string>("");
  const [isCustomModel, setIsCustomModel] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    const active = getActiveProvider();
    setActiveProviderState(active);
    const target = initialProvider || active;
    setSelectedProvider(target);
    loadProviderKey(target);
    updateKeysStatus();

    // Load Ollama state
    setOllamaEndpointState(getOllamaEndpoint());
    setOllamaModelState(getOllamaModel());
  }, [isOpen, initialProvider]);

  const updateKeysStatus = () => {
    const keys = getAllStoredKeys();
    setHasKeys({
      gemini: Boolean(keys.gemini),
      groq: Boolean(keys.groq),
      openai: Boolean(keys.openai),
      ollama: Boolean(keys.ollama),
    });
  };

  const loadProviderKey = (provider: AIProvider) => {
    if (provider === "ollama") {
      setCurrentKey(getOllamaEndpoint());
      setMultiKeys([]);
    } else {
      const keys = getStoredApiKeys(provider);
      setMultiKeys(keys);
      setCurrentKey(""); // new key input starts empty
    }
    // Load selected model for this provider
    const model = getSelectedModel(provider);
    setCloudModel(model);
    const popularModels = AI_PROVIDERS[provider].popularModels;
    setIsCustomModel(popularModels.length > 0 && !popularModels.includes(model));
    setValidationResult({ status: "idle" });
  };

  const handleAddKey = () => {
    const trimmed = currentKey.trim();
    if (!trimmed) return;
    if (multiKeys.includes(trimmed)) {
      setValidationResult({ status: "error", message: "This key is already added." });
      return;
    }
    const updated = [...multiKeys, trimmed];
    setMultiKeys(updated);
    setCurrentKey("");
    saveApiKeys(selectedProvider, updated);
    setActiveProvider(selectedProvider);
    setActiveProviderState(selectedProvider);
    updateKeysStatus();
    onKeysUpdated?.();
    setValidationResult({ status: "success", message: `Key added! ${updated.length} key${updated.length > 1 ? "s" : ""} active for auto-rotation.` });
  };

  const handleRemoveMultiKey = (idx: number) => {
    const updated = multiKeys.filter((_, i) => i !== idx);
    setMultiKeys(updated);
    saveApiKeys(selectedProvider, updated);
    updateKeysStatus();
    onKeysUpdated?.();
  };

  const handleProviderSelect = (provider: AIProvider) => {
    setSelectedProvider(provider);
    loadProviderKey(provider);
  };

  const handleDetectOllama = async () => {
    setIsDetectingOllama(true);
    setValidationResult({ status: "idle" });

    const res = await fetchOllamaModels(ollamaEndpoint);
    setIsDetectingOllama(false);

    if (res.success && res.models.length > 0) {
      setOllamaModelsList(res.models);
      setOllamaModelState(res.models[0].name);
      saveOllamaModel(res.models[0].name);
      setValidationResult({
        status: "success",
        message: `Found ${res.models.length} local models! Connected to Ollama.`,
      });
    } else if (res.success && res.models.length === 0) {
      setValidationResult({
        status: "success",
        message: "Ollama is running, but no models found. Run `ollama run llama3.2` to pull one.",
      });
    } else {
      setValidationResult({
        status: "error",
        message: res.error || "Could not connect to Ollama. Is `ollama serve` running?",
      });
    }
  };

  const handleTestKey = async () => {
    if (selectedProvider === "ollama") {
      setIsValidating(true);
      setValidationResult({ status: "idle" });
      const result = await validateApiKey("ollama", ollamaEndpoint);
      setIsValidating(false);

      if (result.valid) {
        setValidationResult({
          status: "success",
          message: "Success! Local Ollama instance is online and responding.",
        });
        saveOllamaEndpoint(ollamaEndpoint);
        saveOllamaModel(ollamaModel);
        saveApiKey("ollama", ollamaEndpoint);
        setActiveProvider("ollama");
        setActiveProviderState("ollama");
        updateKeysStatus();
        onKeysUpdated?.();
        handleDetectOllama();
      } else {
        setValidationResult({
          status: "error",
          message: result.error || "Failed to reach local Ollama.",
        });
      }
      return;
    }

    if (!currentKey.trim()) {
      setValidationResult({ status: "error", message: "Please enter an API key first." });
      return;
    }

    setIsValidating(true);
    setValidationResult({ status: "idle" });

    const result = await validateApiKey(selectedProvider, currentKey);
    setIsValidating(false);

    if (result.valid) {
      setValidationResult({
        status: "success",
        message: `✅ Valid! Click "Add Key" to add it to rotation.`,
      });
    } else {
      setValidationResult({
        status: "error",
        message: result.error || "Failed to validate key.",
      });
    }
  };

  const handleSave = () => {
    if (selectedProvider === "ollama") {
      saveOllamaEndpoint(ollamaEndpoint);
      saveOllamaModel(ollamaModel);
      saveApiKey("ollama", ollamaEndpoint);
      setActiveProvider("ollama");
      setActiveProviderState("ollama");
    } else {
      // Save the chosen model
      saveSelectedModel(selectedProvider, cloudModel);
      // If there's an unsubmitted key in the input, add it
      if (currentKey.trim() && !multiKeys.includes(currentKey.trim())) {
        const updated = [...multiKeys, currentKey.trim()];
        saveApiKeys(selectedProvider, updated);
      } else {
        saveApiKeys(selectedProvider, multiKeys);
      }
      if (multiKeys.length > 0 || currentKey.trim()) {
        setActiveProvider(selectedProvider);
        setActiveProviderState(selectedProvider);
      }
    }
    updateKeysStatus();
    onKeysUpdated?.();
    onClose();
  };

  const handleRemoveKey = () => {
    if (selectedProvider === "ollama") {
      saveApiKey("ollama", "");
      setOllamaEndpointState("http://localhost:11434");
    } else {
      saveApiKeys(selectedProvider, []);
      setMultiKeys([]);
      setCurrentKey("");
    }
    setValidationResult({ status: "idle" });
    updateKeysStatus();
    onKeysUpdated?.();
  };

  if (!isOpen) return null;

  const currentProviderMeta = AI_PROVIDERS[selectedProvider];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl rounded-2xl bg-[#0F111E] border border-white/[0.1] shadow-2xl p-5 sm:p-7 space-y-5 text-[#F1F1F8] border-t-2 border-violet-500/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                AI Engine & Local LLM Setup
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  BYOK & Local
                </span>
              </h2>
              <p className="text-xs text-[#9B99B5] mt-0.5">
                Connect cloud providers via API keys or run 100% offline via local Ollama.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((prov) => {
            const meta = AI_PROVIDERS[prov];
            const isSelected = selectedProvider === prov;
            const hasKey = hasKeys[prov];
            return (
              <button
                key={prov}
                onClick={() => handleProviderSelect(prov)}
                className={`relative px-2 py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  isSelected
                    ? "bg-violet-600/30 text-white border border-violet-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {prov === "gemini" && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                  {prov === "ollama" && <HardDrive className="w-3.5 h-3.5 text-cyan-400" />}
                  {prov === "groq" && <Zap className="w-3.5 h-3.5 text-indigo-400" />}
                  {prov === "openai" && <Cpu className="w-3.5 h-3.5 text-emerald-400" />}
                  <span className="truncate">{meta.name.split(" ")[0]}</span>
                </div>
                <div className="flex items-center gap-1">
                  {prov === "ollama" ? (
                    <span className="text-[9px] text-cyan-300 font-medium">Local AI</span>
                  ) : hasKey ? (
                    <span className="text-[9px] text-emerald-400 flex items-center gap-0.5 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      Active
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-500 font-normal">
                      {meta.isFreeTier ? "Free" : "Paid"}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Provider Details & Input Area */}
        <div className="space-y-4 rounded-2xl p-4 bg-white/[0.02] border border-white/[0.05]">
          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-white flex items-center gap-2">
                {currentProviderMeta.name}
                {selectedProvider === "ollama" && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                    Zero Internet Needed
                  </span>
                )}
              </p>
              <p className="text-[11px] text-slate-400">{currentProviderMeta.tagline}</p>
            </div>
            <a
              href={currentProviderMeta.getApiKeyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-400 hover:text-violet-300 hover:underline"
            >
              {selectedProvider === "ollama" ? "Ollama Docs" : "Get Key"}{" "}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* If OLLAMA Selected: Host Endpoint & Local Model Selector */}
          {selectedProvider === "ollama" ? (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Ollama Local Host Endpoint
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={ollamaEndpoint}
                    onChange={(e) => setOllamaEndpointState(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="w-full h-10 px-3 pr-24 rounded-xl bg-[#141624] border border-white/[0.09] text-xs text-white font-mono focus:outline-none focus:border-cyan-500/50"
                  />
                  <button
                    type="button"
                    onClick={handleDetectOllama}
                    disabled={isDetectingOllama}
                    className="absolute right-1.5 h-7 px-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                  >
                    {isDetectingOllama ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    <span>Detect</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Active Model
                </label>
                {ollamaModelsList.length > 0 ? (
                  <select
                    value={ollamaModel}
                    onChange={(e) => {
                      setOllamaModelState(e.target.value);
                      saveOllamaModel(e.target.value);
                    }}
                    className="w-full h-10 px-3 rounded-xl bg-[#141624] border border-white/[0.09] text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    {ollamaModelsList.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name} {m.sizeMb ? `(${Math.round(m.sizeMb / 1024)} GB)` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={ollamaModel}
                    onChange={(e) => {
                      setOllamaModelState(e.target.value);
                      saveOllamaModel(e.target.value);
                    }}
                    placeholder="llama3.2, llama3.1, deepseek-r1:8b, mistral..."
                    className="w-full h-10 px-3 rounded-xl bg-[#141624] border border-white/[0.09] text-xs text-white font-mono focus:outline-none focus:border-cyan-500/50"
                  />
                )}
              </div>

              {/* Quick CLI tip */}
              <div className="p-3 rounded-xl bg-[#090A12] border border-white/[0.06] text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>To install and run locally in your terminal:</span>
                </div>
                <code className="text-cyan-300 font-mono text-[11px] block select-all">
                  ollama run llama3.2
                </code>
              </div>
            </div>
          ) : (
            /* Cloud API Providers — Multi-Key Input */
            <div className="space-y-4">
              {/* Step-by-Step API Key Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-transparent border border-violet-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    How to get your {currentProviderMeta.name} API Key
                  </span>
                  <a
                    href={currentProviderMeta.getApiKeyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-all shrink-0"
                  >
                    <span>Get API Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] text-slate-300">
                  <div className="bg-black/30 p-2 rounded-xl border border-white/[0.05]">
                    <span className="font-semibold text-amber-400 block mb-0.5">1. Click link ↗</span>
                    Opens {currentProviderMeta.name} key creation page
                  </div>
                  <div className="bg-black/30 p-2 rounded-xl border border-white/[0.05]">
                    <span className="font-semibold text-cyan-400 block mb-0.5">2. Copy key</span>
                    Create free key & copy to clipboard
                  </div>
                  <div className="bg-black/30 p-2 rounded-xl border border-white/[0.05]">
                    <span className="font-semibold text-emerald-400 block mb-0.5">3. Paste below</span>
                    Paste here and click Add Key!
                  </div>
                </div>
              </div>
              {/* Existing key chips */}
              {multiKeys.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    {multiKeys.length} key{multiKeys.length > 1 ? "s" : ""} active — auto-rotation enabled
                  </p>
                  {multiKeys.map((k, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                      <span className="flex-1 text-xs font-mono text-emerald-300 truncate">
                        {k.slice(0, 8)}{'•'.repeat(12)}{k.slice(-4)}
                      </span>
                      <span className="text-[10px] text-emerald-500 shrink-0">Key {idx + 1}</span>
                      <button
                        onClick={() => handleRemoveMultiKey(idx)}
                        className="p-1 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New key input */}
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  {multiKeys.length === 0 ? "Add your API key" : "Add another API key (for rotation)"}
                </label>
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKey ? "text" : "password"}
                      value={currentKey}
                      onChange={(e) => {
                        setCurrentKey(e.target.value);
                        setValidationResult({ status: "idle" });
                      }}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddKey(); }}
                      placeholder={currentProviderMeta.placeholder}
                      className="w-full h-10 pl-4 pr-10 rounded-xl bg-[#141624] border border-white/[0.09] text-sm text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddKey}
                    disabled={!currentKey.trim()}
                    className="h-10 px-3 rounded-xl bg-violet-600/80 hover:bg-violet-600 disabled:opacity-30 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">
                  💡 Add 2–5 keys from the same provider to bypass rate limits automatically
                </p>
              </div>

              {/* Cloud Model Selector */}
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Active Model
                  <span className="ml-1 text-violet-400 font-normal">(you can type any model ID)</span>
                </label>
                {!isCustomModel ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={cloudModel}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__custom__") {
                          setIsCustomModel(true);
                          setCloudModel("");
                        } else {
                          setCloudModel(val);
                          saveSelectedModel(selectedProvider, val);
                        }
                      }}
                      className="flex-1 h-10 px-3 rounded-xl bg-[#141624] border border-white/[0.09] text-xs text-white focus:outline-none focus:border-violet-500/50 font-mono"
                    >
                      {currentProviderMeta.popularModels.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                      <option value="__custom__">✏️ Enter custom model ID...</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={cloudModel}
                      onChange={(e) => {
                        setCloudModel(e.target.value);
                      }}
                      onBlur={() => {
                        if (cloudModel.trim()) {
                          saveSelectedModel(selectedProvider, cloudModel.trim());
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && cloudModel.trim()) {
                          saveSelectedModel(selectedProvider, cloudModel.trim());
                        }
                      }}
                      placeholder="e.g. llama-3.3-70b-versatile, gpt-4o, gemini-2.5-flash..."
                      className="flex-1 h-10 px-3 rounded-xl bg-[#141624] border border-white/[0.09] text-xs text-white font-mono focus:outline-none focus:border-violet-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomModel(false);
                        const fallback = currentProviderMeta.popularModels[0] || currentProviderMeta.defaultModel;
                        setCloudModel(fallback);
                        saveSelectedModel(selectedProvider, fallback);
                      }}
                      className="h-10 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-[11px] font-medium border border-white/[0.08] transition-colors shrink-0"
                    >
                      Presets
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-slate-500 mt-1.5">
                  💡 Choose a popular model from the dropdown, or enter any custom model ID supported by {currentProviderMeta.name}
                </p>
              </div>
            </div>
          )}

          {/* Validation Feedback */}
          {validationResult.status === "success" && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{validationResult.message}</span>
            </div>
          )}

          {validationResult.status === "error" && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span className="truncate">{validationResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={isValidating || (selectedProvider !== "ollama" && !currentKey.trim())}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] transition-colors disabled:opacity-40 flex items-center gap-2"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Testing...
              </>
            ) : selectedProvider === "ollama" ? (
              "Ping Ollama"
            ) : (
              "Test Connection"
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
            >
              Save & Use
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
