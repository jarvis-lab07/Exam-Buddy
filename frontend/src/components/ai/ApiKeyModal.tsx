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
  Cpu,
  Zap,
} from "lucide-react";
import {
  AI_PROVIDERS,
  type AIProvider,
  getStoredApiKey,
  saveApiKey,
  validateApiKey,
  getActiveProvider,
  setActiveProvider,
  getAllStoredKeys,
} from "@/lib/ai-service";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeysUpdated?: () => void;
}

export function ApiKeyModal({ isOpen, onClose, onKeysUpdated }: ApiKeyModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>("gemini");
  const [currentKey, setCurrentKey] = useState<string>("");
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
  });

  // Reload stored keys on open or provider change
  useEffect(() => {
    if (!isOpen) return;
    const active = getActiveProvider();
    setActiveProviderState(active);
    setSelectedProvider(active);
    loadProviderKey(active);
    updateKeysStatus();
  }, [isOpen]);

  const updateKeysStatus = () => {
    const keys = getAllStoredKeys();
    setHasKeys({
      gemini: Boolean(keys.gemini),
      groq: Boolean(keys.groq),
      openai: Boolean(keys.openai),
    });
  };

  const loadProviderKey = (provider: AIProvider) => {
    const key = getStoredApiKey(provider);
    setCurrentKey(key);
    setValidationResult({ status: "idle" });
  };

  const handleProviderSelect = (provider: AIProvider) => {
    setSelectedProvider(provider);
    loadProviderKey(provider);
  };

  const handleTestKey = async () => {
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
        message: `Success! Connected to ${AI_PROVIDERS[selectedProvider].name}.`,
      });
      // Save valid key immediately
      saveApiKey(selectedProvider, currentKey);
      setActiveProvider(selectedProvider);
      setActiveProviderState(selectedProvider);
      updateKeysStatus();
      onKeysUpdated?.();
    } else {
      setValidationResult({
        status: "error",
        message: result.error || "Failed to validate key.",
      });
    }
  };

  const handleSave = () => {
    saveApiKey(selectedProvider, currentKey);
    if (currentKey.trim()) {
      setActiveProvider(selectedProvider);
      setActiveProviderState(selectedProvider);
    }
    updateKeysStatus();
    onKeysUpdated?.();
    onClose();
  };

  const handleRemoveKey = () => {
    saveApiKey(selectedProvider, "");
    setCurrentKey("");
    setValidationResult({ status: "idle" });
    updateKeysStatus();
    onKeysUpdated?.();
  };

  if (!isOpen) return null;

  const currentProviderMeta = AI_PROVIDERS[selectedProvider];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-[#0F111E] border border-white/[0.1] shadow-2xl p-6 sm:p-7 space-y-6 text-[#F1F1F8]"
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
                AI Engine & BYOK Keys
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  Private & Local
                </span>
              </h2>
              <p className="text-xs text-[#9B99B5] mt-0.5">
                Keys are stored only in your browser. Never sent to any central server.
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
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((prov) => {
            const meta = AI_PROVIDERS[prov];
            const isSelected = selectedProvider === prov;
            const hasKey = hasKeys[prov];
            return (
              <button
                key={prov}
                onClick={() => handleProviderSelect(prov)}
                className={`relative px-3 py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  isSelected
                    ? "bg-violet-600/30 text-white border border-violet-500/40 shadow-lg shadow-violet-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {prov === "gemini" && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                  {prov === "groq" && <Zap className="w-3.5 h-3.5 text-cyan-400" />}
                  {prov === "openai" && <Cpu className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{meta.name.split(" ")[0]}</span>
                </div>
                <div className="flex items-center gap-1">
                  {hasKey ? (
                    <span className="text-[9px] text-emerald-400 flex items-center gap-0.5 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
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

        {/* Provider Details & Input */}
        <div className="space-y-4 rounded-2xl p-4 bg-white/[0.02] border border-white/[0.05]">
          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-white">{currentProviderMeta.name}</p>
              <p className="text-[11px] text-slate-400">{currentProviderMeta.tagline}</p>
            </div>
            <a
              href={currentProviderMeta.getApiKeyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-400 hover:text-violet-300 hover:underline"
            >
              Get free key <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={currentKey}
              onChange={(e) => {
                setCurrentKey(e.target.value);
                setValidationResult({ status: "idle" });
              }}
              placeholder={currentProviderMeta.placeholder}
              className="w-full h-11 pl-4 pr-20 rounded-xl bg-[#141624] border border-white/[0.09] text-sm text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {currentKey && (
                <button
                  type="button"
                  onClick={handleRemoveKey}
                  title="Remove Key"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

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
            disabled={isValidating || !currentKey.trim()}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] transition-colors disabled:opacity-40 flex items-center gap-2"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Testing...
              </>
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
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 transition-colors"
            >
              Save & Use
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
