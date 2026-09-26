"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Edit2,
  Timer,
  ChevronDown,
  ChevronUp,
  Brain,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_USER } from "@/lib/mock-data";
import { UserProfile } from "@/types";
import { ProfileEditModal } from "@/components/profile/ProfileEditModal";
import { PomodoroTimer } from "@/components/focus/PomodoroTimer";
import { AmbientPlayer } from "@/components/focus/AmbientPlayer";
import { usePomodoro } from "@/contexts/PomodoroContext";

export type SidebarState = "open" | "icon" | "hidden";


interface SidebarProps {
  state: SidebarState;
  onToggle: () => void;
  onCloseMobile?: () => void;
  isMobileOpen?: boolean;
}

const navItems = [
  {
    name: "Subjects & Units",
    href: "/subjects",
    icon: BookOpen,
    badge: "4 Active",
    badgeClass: "bg-white/[0.05] text-[#9B99B5] border-white/10",
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
    badge: "12 New",
    badgeClass: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  },
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    badge: null as string | null,
    badgeClass: "",
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
    badgeClass: "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
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

  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFocusOpen, setIsFocusOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("exam_buddy_user_profile");
      if (stored) {
        setUserProfile(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const storagePercent = Math.round(
    (userProfile.cloudStorageUsedGB / userProfile.cloudStorageTotalGB) * 100
  );
  const tokenPercent = Math.round(
    (userProfile.aiTokensUsed / userProfile.aiTokensTotal) * 100
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

        {/* Now Studying Widget */}
        <NowStudyingWidget isIcon={isIcon} />

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
          {/* ── Focus Hub Section (Pomodoro + Ambient Lo-Fi) ── */}
          {!isIcon && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsFocusOpen((v) => !v)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-white/[0.04] transition-colors group"
                title="Toggle focus tools"
              >
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#9B99B5] uppercase tracking-[0.14em]">
                  <Timer className="w-3.5 h-3.5 text-violet-400" />
                  Focus Hub
                </span>
                {isFocusOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-[#5A5875] group-hover:text-white transition-colors" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-[#5A5875] group-hover:text-white transition-colors" />
                )}
              </button>

              {isFocusOpen && (
                <div className="space-y-2 px-0.5 animate-[fadeIn_0.2s_ease-out]">
                  <PomodoroTimer size="compact" />
                  <AmbientPlayer />
                </div>
              )}
            </div>
          )}

          {/* Icon-only compact focus indicator */}
          {isIcon && (
            <div className="lg:flex hidden justify-center">
              <div
                className="p-2 rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/25"
                title="Focus Hub — Pomodoro & Lo-Fi (expand sidebar to access)"
              >
                <Timer className="w-4 h-4" />
              </div>
            </div>
          )}

          <div
            onClick={() => setIsProfileModalOpen(true)}
            className={cn(
              "flex items-center gap-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-violet-500/30 p-2.5 cursor-pointer transition-all group",
              isIcon && "lg:justify-center lg:p-2"
            )}
            title="Click to edit student profile"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-xs font-bold text-white shrink-0">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
            <div className={cn("min-w-0 flex-1", isIcon && "lg:hidden")}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#F1F1F8] truncate group-hover:text-violet-300 transition-colors">
                  {userProfile.username}
                </p>
                <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-violet-400 transition-colors" />
              </div>
              <p className="text-[10px] text-[#9B99B5] truncate">
                {userProfile.college.split(" ")[0]} • {userProfile.branch.split(" ")[0]} • {userProfile.semester}
              </p>
            </div>
          </div>

          <div className={cn(isIcon && "lg:hidden")}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 text-[#9B99B5] font-medium">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                <span>{userProfile.cloudStorageUsedGB} / {userProfile.cloudStorageTotalGB} GB</span>
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
                <span>{Math.round(userProfile.aiTokensUsed / 1000)}k / {Math.round(userProfile.aiTokensTotal / 1000)}k</span>
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

      {/* Student Profile Modal */}
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={userProfile}
        onSave={setUserProfile}
      />
    </>
  );
}

/* ──────────────────────────────────────────────────────────
   SUBCOMPONENTS
   ────────────────────────────────────────────────────────── */

function NowStudyingWidget({ isIcon }: { isIcon: boolean }) {
  const router = useRouter();
  const { session } = usePomodoro();

  const nowStudying = useMemo(() => {
    return {
      active: Boolean(session?.isRunning),
      timeLeftSec: session?.timeLeftSeconds ?? 0,
      mode: session?.mode ?? ("focus" as "focus" | "shortBreak" | "longBreak"),
      subjectName: "Data Structures",
      subjectCode: "DSA",
      subjectColor: "#6366F1",
      unitTitle: "Unit 3 · Hashing",
    };
  }, [session?.isRunning, session?.timeLeftSeconds, session?.mode]);

  if (isIcon) {
    return (
      <div className="lg:flex hidden justify-center pt-3 px-2">
        <div
          className={cn(
            "relative p-2 rounded-xl border transition-all",
            nowStudying.active
              ? "bg-violet-500/20 text-violet-400 border-violet-500/35 shadow-lg shadow-violet-500/20"
              : "bg-white/[0.03] text-[#9B99B5] border-white/[0.06]"
          )}
          title={
            nowStudying.active
              ? `Now studying — ${nowStudying.subjectName} (${formatSeconds(nowStudying.timeLeftSec)} left)`
              : "No active session — click to open Planner"
          }
        >
          <Brain className="w-4 h-4" />
          {nowStudying.active && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse ring-2 ring-[#0C0C14]" />
          )}
        </div>
      </div>
    );
  }

  if (!nowStudying.active) {
    return (
      <div
        className="now-studying-widget mt-3 mx-3 px-3 py-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-between gap-2 animate-[fadeIn_0.2s_ease-out]"
      >
        <div className="min-w-0 flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[#5A5875] shrink-0">
            <Brain className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#5A5875]">
              Now Studying
            </div>
            <div className="text-[11px] font-medium text-[#9B99B5]">No active session</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push("/planner")}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold transition-colors shadow-lg shadow-violet-600/30 shrink-0"
        >
          <Play className="w-2.5 h-2.5 fill-white" />
          Start
        </button>
      </div>
    );
  }

  const mins = Math.floor(nowStudying.timeLeftSec / 60);
  const secs = nowStudying.timeLeftSec % 60;

  return (
    <div
      className="now-studying-widget mt-3 mx-3 px-3 py-3 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/15 via-indigo-600/10 to-transparent shadow-lg shadow-violet-600/15 relative overflow-hidden animate-[fadeIn_0.2s_ease-out]"
    >
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-violet-500/15 blur-2xl pointer-events-none" />

      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0 flex items-start gap-2.5">
          <div
            className="relative p-2 rounded-xl shrink-0"
            style={{
              backgroundColor: `${nowStudying.subjectColor}18`,
              border: `1px solid ${nowStudying.subjectColor}40`,
              color: nowStudying.subjectColor,
            }}
          >
            <Brain className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 flex w-2.5 h-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 ring-2 ring-[#0C0C14]" />
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-violet-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ◉ LIVE · {nowStudying.mode === "focus" ? "Focus" : nowStudying.mode === "shortBreak" ? "Short Break" : "Long Break"}
            </div>
            <div className="text-sm font-bold text-white truncate">
              {nowStudying.subjectName}
              <span className="text-[10px] font-mono ml-1 text-violet-300">
                {nowStudying.subjectCode}
              </span>
            </div>
            <div className="text-[10px] text-[#9B99B5] truncate">{nowStudying.unitTitle}</div>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-[10px] font-semibold text-[#5A5875] uppercase tracking-wider">
            Remaining
          </span>
          <span className="font-mono text-base font-black text-white leading-none mt-0.5">
            {String(mins).padStart(2, "0")}
            <span className="text-violet-300">:</span>
            {String(secs).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}

function formatSeconds(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

