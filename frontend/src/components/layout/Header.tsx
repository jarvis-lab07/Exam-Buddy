"use client";

import React, { useEffect, useState } from "react";
import { Search, Flame, Bell, Menu } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 grid grid-cols-[auto_1fr_auto] items-center gap-3 h-14 px-3 sm:px-5 bg-[#0C0C14]/80 backdrop-blur-xl border-b border-white/[0.07]">
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-xl text-[#9B99B5] hover:text-white hover:bg-white/[0.06] transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex justify-center min-w-0">
        <label className="relative flex items-center w-full max-w-xl">
          <Search className="absolute left-3 w-4 h-4 text-[#5A5875] pointer-events-none" />
          <input
            id="global-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics, notes, formulas..."
            className="w-full h-9 pl-9 pr-16 rounded-xl bg-[#13131F] border border-white/[0.08] text-sm text-[#F1F1F8] placeholder:text-[#5A5875] focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20"
          />
          <span className="hidden sm:inline-flex absolute right-2 items-center px-1.5 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-[10px] font-medium text-[#9B99B5]">
            Ctrl+K
          </span>
        </label>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
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
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
            </span>
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

        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-white font-bold text-xs">
            D
          </div>
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#0C0C14]" />
        </div>
      </div>
    </header>
  );
}
