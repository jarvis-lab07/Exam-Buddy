"use client";

import React, { useEffect, useState } from "react";
import { Search, Flame, Bell, Menu, Sparkles, Key, PanelRightClose, PanelRightOpen, LogIn, UserCheck } from "lucide-react";
import { AiSearchModal } from "@/components/search/AiSearchModal";
import { ApiKeyModal } from "@/components/ai/ApiKeyModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { getActiveProvider, getStoredApiKey, AI_PROVIDERS, type AIProvider } from "@/lib/ai-service";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleFocusDock?: () => void;
  focusDockExpanded?: boolean;
}

export function Header({ onToggleSidebar, onToggleFocusDock, focusDockExpanded }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<AIProvider>("gemini");
  const [hasApiKey, setHasApiKey] = useState(false);

  const { user, signOut, isConfigured } = useAuth();

  const refreshKeyStatus = () => {
    const prov = getActiveProvider();
    setActiveProvider(prov);
    const key = getStoredApiKey(prov);
    setHasApiKey(Boolean(key));
  };

  useEffect(() => {
    refreshKeyStatus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 grid grid-cols-[auto_1fr_auto] items-center gap-3 h-14 px-3 sm:px-5 bg-[#0C0C14]/80 backdrop-blur-xl border-b border-white/[0.07]">
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-[#9B99B5] hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {onToggleFocusDock !== undefined && (
            <button
              onClick={onToggleFocusDock}
              className={cn(
                "hidden lg:flex items-center p-2 rounded-xl transition-colors",
                focusDockExpanded
                  ? "text-violet-300 bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/30"
                  : "text-[#9B99B5] hover:text-white hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12]"
              )}
              aria-label={focusDockExpanded ? "Collapse focus dock" : "Expand focus dock"}
              title={focusDockExpanded ? "Hide Focus Dock" : "Show Focus Dock"}
            >
              {focusDockExpanded ? (
                <PanelRightClose className="w-4.5 w-[18px] h-[18px]" />
              ) : (
                <PanelRightOpen className="w-4.5 w-[18px] h-[18px]" />
              )}
            </button>
          )}
        </div>

        <div className="flex justify-center min-w-0">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="relative flex items-center w-full max-w-xl h-9 pl-9 pr-16 rounded-xl bg-[#13131F] hover:bg-[#181827] border border-white/[0.08] hover:border-violet-500/40 text-sm text-[#5A5875] hover:text-slate-300 transition-all text-left group"
          >
            <Search className="absolute left-3 w-4 h-4 text-[#5A5875] group-hover:text-violet-400 transition-colors" />
            <span className="truncate">Ask AI Tutor or search syllabus...</span>
            <span className="hidden sm:inline-flex absolute right-2 items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-[10px] font-medium text-[#9B99B5]">
              <Sparkles className="w-2.5 h-2.5 text-violet-400" />
              Ctrl+K
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick BYOK Key Badge */}
          <button
            type="button"
            onClick={() => setIsKeyModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs transition-colors"
            title="Configure AI API Key (Gemini, Groq, OpenAI)"
          >
            <Key className="w-3 h-3 text-amber-400" />
            {hasApiKey ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                {AI_PROVIDERS[activeProvider].name.split(" ")[0]}
              </span>
            ) : (
              <span className="text-amber-300 font-medium text-[11px]">API Key</span>
            )}
          </button>

          <div className="badge-streak hidden xs:inline-flex sm:inline-flex h-8 px-2.5 border border-amber-500/35 bg-amber-500/10">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
            <span>7 Days</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="relative p-2 rounded-xl text-[#9B99B5] hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-400 ring-2 ring-[#0C0C14]" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 p-3 card shadow-2xl z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
                  <span className="text-xs font-semibold text-white">Notifications</span>
                  <button
                    className="text-[10px] text-violet-400 hover:underline"
                    onClick={() => setShowNotifications(false)}
                  >
                    Mark all read
                  </button>
                </div>
                <p className="text-xs text-[#9B99B5] leading-relaxed">
                  AVL Trees summary is ready. Your 7-day streak is still active.
                </p>
              </div>
            )}
          </div>

          {/* User Account / Auth Trigger */}
          {user ? (
            <button
              onClick={() => signOut()}
              title={`Logged in as ${user.email}. Click to sign out.`}
              className="relative flex items-center gap-2 p-1 pr-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden md:inline text-xs text-slate-300 max-w-[90px] truncate">
                {user.email?.split('@')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-violet-600/80 hover:bg-violet-600 text-white text-xs font-semibold transition-all shadow-md shadow-violet-500/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Global Modals */}
      <AiSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onOpenKeyModal={() => {
          setIsSearchOpen(false);
          setIsKeyModalOpen(true);
        }}
      />

      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeysUpdated={refreshKeyStatus}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}

