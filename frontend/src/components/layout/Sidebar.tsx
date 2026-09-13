"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  UploadCloud,
  Bot,
  CalendarDays,
  Layers,
  Cpu,
  GraduationCap,
  HardDrive,
  Sparkles,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_USER } from "@/lib/mock-data";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Subjects & Units",
    href: "/subjects",
    icon: BookOpen,
    badge: "4 Active",
  },
  {
    name: "Upload Center",
    href: "/upload",
    icon: UploadCloud,
    badge: null,
  },
  {
    name: "AI Tutor Chat",
    href: "/chat",
    icon: Bot,
    badge: "GPT-4o",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  },
  {
    name: "Study Planner",
    href: "/planner",
    icon: CalendarDays,
    badge: "3 Due",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  {
    name: "Flashcards",
    href: "/flashcards",
    icon: Layers,
    badge: null,
  },
  {
    name: "AI Manager",
    href: "/ai-manager",
    icon: Cpu,
    badge: "Beta",
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const storagePercent = Math.round(
    (MOCK_USER.cloudStorageUsedGB / MOCK_USER.cloudStorageTotalGB) * 100
  );
  const tokenPercent = Math.round(
    (MOCK_USER.aiTokensUsed / MOCK_USER.aiTokensTotal) * 100
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-[#0A0E1A]/90 backdrop-blur-2xl border-r border-white/[0.08] text-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* App Logo & Cohort Header */}
        <div className="p-5 border-b border-white/[0.07]">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 group focus:outline-none"
              onClick={onClose}
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300">
                <GraduationCap className="w-5 h-5 text-white" />
                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 opacity-0 group-hover:opacity-30 blur transition duration-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-white font-sans">
                    Exam<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">Buddy</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Smart Exam Companion</p>
              </div>
            </Link>

            {/* Mobile Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] lg:hidden"
                aria-label="Close Sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Active Cohort Pill */}
          <div className="mt-4 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-slate-300 font-medium truncate">
                {MOCK_USER.activeCohort}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono bg-white/[0.05] px-1.5 py-0.5 rounded">
              Sem 3
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-indigo-600/20 to-violet-600/10 text-white border border-indigo-500/30 shadow-sm shadow-indigo-500/10"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent"
                )}
              >
                {/* Active Left Indicator Pill */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-indigo-400 to-violet-500 shadow-sm shadow-indigo-400/50" />
                )}

                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-1.5 rounded-lg transition-colors duration-200",
                      isActive
                        ? "text-indigo-400 bg-indigo-500/15"
                        : "text-slate-400 group-hover:text-indigo-300 group-hover:bg-white/[0.04]"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate">{item.name}</span>
                </div>

                {item.badge ? (
                  <span
                    className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                      item.badgeColor ||
                        "bg-white/[0.05] text-slate-400 border-white/[0.08]"
                    )}
                  >
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight
                    className={cn(
                      "w-3.5 h-3.5 text-slate-500 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all",
                      isActive && "opacity-60 translate-x-0 text-indigo-400"
                    )}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Gauges */}
        <div className="p-4 m-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3.5">
          {/* Cloud Storage Meter */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cloud Storage</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {MOCK_USER.cloudStorageUsedGB} / {MOCK_USER.cloudStorageTotalGB} GB
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
          </div>

          {/* AI Token Usage Meter */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>AI Tokens</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {(MOCK_USER.aiTokensUsed / 1000).toFixed(0)}k / {(MOCK_USER.aiTokensTotal / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-500"
                style={{ width: `${tokenPercent}%` }}
              />
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/[0.05]">
            <span>Active Model</span>
            <span className="text-indigo-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Claude 3.7 + GPT-4o
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
