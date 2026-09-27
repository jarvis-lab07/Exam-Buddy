"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Flame,
  Bell,
  Menu,
  Sparkles,
  Key,
  Timer,
  LogIn,
  Moon,
  Sun,
  Trees,
} from "lucide-react";
import { AiSearchModal } from "@/components/search/AiSearchModal";
import { ApiKeyModal } from "@/components/ai/ApiKeyModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
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

  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

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
      <header className="sticky top-0 z-30 grid grid-cols-[auto_1fr_auto] items-center gap-3 h-14 px-3 sm:px-5 bg-color-surface/90 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-var(--text-muted) hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Focus Drawer Toggle */}
          {onToggleFocusDock !== undefined && (
            <button
              onClick={onToggleFocusDock}
              className={cn(
                "flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-xs font-semibold transition-all border",
                focusDockExpanded
                  ? "bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-500/20"
                  : "bg-white/[0.04] text-var(--text-secondary) hover:bg-white/[0.08] border-white/[0.08]"
              )}
              title="Toggle Focus Hub (Pomodoro & Ambient Lo-Fi)"
            >
              <Timer className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline">Focus</span>
            </button>
          )}
        </div>

        {/* Global Search Bar */}
        <div className="flex justify-center min-w-0">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="relative flex items-center w-full max-w-xl h-9 pl-9 pr-16 rounded-xl bg-var(--input-bg) hover:bg-var(--bg-elevated) border border-white/[0.08] hover:border-violet-500/40 text-sm text-var(--text-muted) hover:text-var(--text-secondary) transition-all text-left group"
          >
            <Search className="absolute left-3 w-4 h-4 text-var(--text-muted) group-hover:text-violet-400 transition-colors" />
            <span className="truncate">Ask AI Tutor or search syllabus...</span>
            <span className="hidden sm:inline-flex absolute right-2 items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-[10px] font-medium text-var(--text-muted)">
              <Sparkles className="w-2.5 h-2.5 text-violet-400" />
              Ctrl+K
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* 3-Way Theme Switcher Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] gap-1">
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "p-1.5 rounded-lg text-xs transition-colors",
                theme === "dark" ? "bg-violet-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              )}
              title="Night Study (Midnight Dark)"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setTheme("light")}
              className={cn(
                "p-1.5 rounded-lg text-xs transition-colors",
                theme === "light" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              )}
              title="Pro Daylight (Clean White)"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setTheme("nature")}
              className={cn(
                "p-1.5 rounded-lg text-xs transition-colors",
                theme === "nature" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              )}
              title="Nature Calm (Live Motion Wallpaper)"
            >
              <Trees className="w-3.5 h-3.5" />
            </button>
          </div>

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
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
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
                <p className="text-xs text-slate-400 leading-relaxed">
                  AVL Trees summary is ready. Your 7-day streak is active.
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
