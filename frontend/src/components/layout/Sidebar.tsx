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
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_USER } from "@/lib/mock-data";

export type SidebarState = "open" | "icon" | "hidden";

interface SidebarProps {
  state: SidebarState;
  onToggle: () => void;
  onCloseMobile?: () => void;
  isMobileOpen?: boolean;
}

const navItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    badge: null as string | null,
    badgeClass: "",
  },
  {
    name: "Subjects & Units",
    href: "/subjects",
    icon: BookOpen,
    badge: "4 Active",
    badgeClass: "bg-white/[0.05] text-[#9B99B5] border-white/10",
  },
  {
    name: "Upload Center",
    href: "/upload",
    icon: UploadCloud,
    badge: null,
    badgeClass: "",
  },
  {
    name: "AI Tutor Chat",
    href: "/chat",
    icon: Bot,
    badge: "GPT-4o",
    badgeClass: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  },
  {
    name: "Study Planner",
    href: "/planner",
    icon: CalendarDays,
    badge: "3 Due",
    badgeClass: "badge-streak border-0",
  },
  {
    name: "Flashcards",
    href: "/flashcards",
    icon: Layers,
    badge: null,
    badgeClass: "",
  },
  {
    name: "AI Manager",
    href: "/ai-manager",
    icon: Cpu,
    badge: null,
    badgeClass: "",
  },
];

export function Sidebar({
  state,
  onToggle,
  onCloseMobile,
  isMobileOpen = false,
}: SidebarProps) {
  const pathname = usePathname();
  const isIcon = state === "icon";
  const isHidden = state === "hidden";

  const storagePercent = Math.round(
    (MOCK_USER.cloudStorageUsedGB / MOCK_USER.cloudStorageTotalGB) * 100
  );
  const tokenPercent = Math.round(
    (MOCK_USER.aiTokensUsed / MOCK_USER.aiTokensTotal) * 100
  );

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0C0C14]/70 backdrop-blur-md lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-white/[0.08] bg-[#0C0C14]/95 backdrop-blur-2xl text-[#F1F1F8] transition-all duration-300 ease-in-out",
          "w-64",
          isMobileOpen ? "translate-x-0" : "translate-x-[-100%]",
          "lg:translate-x-0",
          !isMobileOpen && isHidden && "lg:translate-x-[-100%]",
          !isHidden && isIcon && "lg:w-16",
          !isHidden && !isIcon && "lg:w-64"
        )}
      >
        <div
          className={cn(
            "flex items-center border-b border-white/[0.07] h-14 shrink-0",
            isIcon ? "lg:px-2 lg:justify-center" : "px-4 justify-between"
          )}
        >
          <Link
            href="/"
            onClick={onCloseMobile}
            className={cn(
              "flex items-center gap-2.5 min-w-0",
              isIcon && "lg:justify-center"
            )}
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6366F1] shadow-lg shadow-violet-500/25 shrink-0">
              <GraduationCap className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
            </div>
            <span
              className={cn(
                "font-bold text-[15px] tracking-tight text-[#F1F1F8]",
                isIcon && "lg:hidden"
              )}
            >
              Exam<span className="text-brand">Buddy</span>
            </span>
          </Link>

          <button
            onClick={onToggle}
            className={cn(
              "hidden lg:inline-flex p-1.5 rounded-lg text-[#9B99B5] hover:text-white hover:bg-white/[0.06] transition-colors",
              isIcon && "lg:hidden"
            )}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>

          <button
            onClick={onToggle}
            className={cn(
              "hidden p-1.5 rounded-lg text-[#9B99B5] hover:text-white hover:bg-white/[0.06] transition-colors",
              isIcon && "lg:inline-flex"
            )}
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>

          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-[#9B99B5] hover:text-white hover:bg-white/[0.06] lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className={cn("flex-1 py-4 overflow-y-auto", isIcon ? "lg:px-2 px-3" : "px-3")}>
          <div
            className={cn(
              "px-3 pb-2 text-[10px] font-semibold text-[#5A5875] uppercase tracking-[0.14em]",
              isIcon && "lg:hidden"
            )}
          >
            Workspace
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={isIcon ? item.name : undefined}
                  className={cn(
                    "group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                    isIcon ? "lg:justify-center lg:px-0 lg:py-2.5 px-3 py-2.5 gap-3" : "justify-between px-3 py-2.5",
                    isActive
                      ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-white"
                      : "text-[#9B99B5] hover:text-[#F1F1F8] hover:bg-[#1A1A2E]"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-gradient-to-b from-[#7C3AED] to-[#6366F1]" />
                  )}

                  <span className={cn("flex items-center min-w-0", isIcon ? "lg:gap-0 gap-3" : "gap-3")}>
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0",
                        isActive ? "text-violet-300" : "text-[#9B99B5] group-hover:text-violet-300"
                      )}
                    />
                    <span className={cn("truncate", isIcon && "lg:hidden")}>{item.name}</span>
                  </span>

                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0",
                        item.badgeClass,
                        isIcon && "lg:hidden"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}

                  {isIcon && (
                    <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#1A1A2E] px-2 py-1 text-xs text-white border border-white/10 opacity-0 group-hover:opacity-100 z-50 hidden lg:block">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className={cn("mt-auto border-t border-white/[0.07] p-3 space-y-3", isIcon && "lg:px-2")}>
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5",
              isIcon && "lg:justify-center lg:p-2"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-xs font-bold text-white shrink-0">
              D
            </div>
            <div className={cn("min-w-0", isIcon && "lg:hidden")}>
              <p className="text-xs font-semibold text-[#F1F1F8] truncate">
                {MOCK_USER.username}
              </p>
              <p className="text-[10px] text-[#9B99B5] truncate">VJTI • CS • Sem 3</p>
            </div>
          </div>

          <div className={cn(isIcon && "lg:hidden")}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 text-[#9B99B5] font-medium">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                <span>4.2 / 10 GB</span>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#1A1A2E] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
          </div>

          <div className={cn(isIcon && "lg:hidden")}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 text-[#9B99B5] font-medium">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>78k / 100k</span>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#1A1A2E] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6366F1]"
                style={{ width: `${tokenPercent}%` }}
              />
            </div>
          </div>

          <div
            className={cn(
              "flex items-center gap-2 text-[11px] text-[#9B99B5]",
              isIcon && "lg:justify-center"
            )}
            title="Claude 3.7 + GPT-4o"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className={cn(isIcon && "lg:hidden")}>Claude 3.7 + GPT-4o</span>
          </div>
        </div>
      </aside>
    </>
  );
}
