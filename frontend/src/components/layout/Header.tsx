"use client";

import React, { useState } from "react";
import {
  Search,
  Flame,
  Bell,
  Menu,
  Sparkles,
  Command,
  BookMarked,
  CheckCircle2,
} from "lucide-react";
import { MOCK_USER } from "@/lib/mock-data";

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-8 bg-[#090D16]/80 backdrop-blur-xl border-b border-white/[0.07]">
        {/* Left: Mobile Toggle & Global Search */}
        <div className="flex items-center gap-3 lg:gap-6 flex-1 max-w-xl">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] lg:hidden focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Search Input / Modal Trigger */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center justify-between w-full max-w-md px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-indigo-500/40 text-slate-400 hover:text-slate-200 transition-all group"
          >
            <div className="flex items-center gap-2.5 text-xs font-medium">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              <span>Search topics, notes, formulas, past papers...</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono text-slate-400">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </button>
        </div>

        {/* Right: Badges, Notifications & Profile */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Cohort Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="font-semibold">{MOCK_USER.college}</span>
            <span className="text-indigo-400/60">•</span>
            <span className="text-slate-300">{MOCK_USER.branch}</span>
          </div>

          {/* Gamified Streak Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-red-500/15 border border-amber-500/30 text-xs font-semibold text-amber-300 shadow-sm shadow-amber-500/10 animate-subtle">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
            <span>{MOCK_USER.streakDays}-Day Streak</span>
          </div>

          {/* Notification Center Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors focus:outline-none"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {/* Unread indicator dot */}
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500 border border-[#090D16]" />
              </span>
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 p-3 rounded-2xl glass-card border border-white/[0.1] shadow-2xl z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
                  <span className="text-xs font-semibold text-white">Notifications</span>
                  <span className="text-[10px] text-indigo-400 hover:underline cursor-pointer">Mark all read</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-200 font-medium">AI Summary Generated</p>
                      <p className="text-[11px] text-slate-400">AVL Trees & Red-Black Rotations is ready for review.</p>
                      <span className="text-[9px] text-slate-500">12m ago</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                      <Flame className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-200 font-medium">Streak Milestone!</p>
                      <p className="text-[11px] text-slate-400">You reached 7 consecutive days of active revision.</p>
                      <span className="text-[9px] text-slate-500">2h ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Student Profile Avatar */}
          <div className="flex items-center gap-3 pl-2 border-l border-white/[0.08]">
            <div className="relative">
              <div className="w-9 h-9 rounded-full ring-2 ring-indigo-500/40 overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
                {MOCK_USER.name.slice(0, 1)}
              </div>
              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#090D16]" />
            </div>

            <div className="hidden xl:block text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-white leading-none">
                  {MOCK_USER.name}
                </span>
                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {MOCK_USER.username}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Search Modal Overlay */}
      {showSearchModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-24 px-4"
          onClick={() => setShowSearchModal(false)}
        >
          <div
            className="w-full max-w-xl p-4 rounded-2xl glass-card border border-white/[0.15] shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <Search className="w-5 h-5 text-indigo-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search across CS301, CS302, DBMS, Discrete Math..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              <span className="text-[11px] font-mono text-slate-400 bg-white/[0.06] px-2 py-0.5 rounded">
                ESC
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                Quick Shortcuts
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] cursor-pointer flex items-center gap-2.5"
                  onClick={() => setShowSearchModal(false)}
                >
                  <BookMarked className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs text-slate-200">DSA: AVL Trees Notes</span>
                </div>
                <div
                  className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] cursor-pointer flex items-center gap-2.5"
                  onClick={() => setShowSearchModal(false)}
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-slate-200">Start Quiz: Computer Networks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
