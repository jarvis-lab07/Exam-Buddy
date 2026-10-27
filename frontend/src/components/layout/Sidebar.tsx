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
  Trophy,
  Cloud,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_USER } from "@/lib/mock-data";
import { UserProfile } from "@/types";
import { ProfileEditModal } from "@/components/profile/ProfileEditModal";
import { useAuth } from "@/contexts/AuthContext";
import { PomodoroTimer } from "@/components/focus/PomodoroTimer";
import { AmbientPlayer } from "@/components/focus/AmbientPlayer";
import { usePomodoro } from "@/contexts/PomodoroContext";
import { isDriveConnectedInStorage, getDriveStorageQuota } from "@/lib/google-drive-service";
import { getAIAnalyticsSummary } from "@/lib/ai-gateway/logger";
import { getActiveProvider, getSelectedModel } from "@/lib/ai-service";

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
    badgeClass: "bg-white/[0.05] text-[var(--text-secondary)] border-white/10",
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
    badgeClass: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/25",
  },
  {
    name: "Exam Simulator",
    href: "/exam",
    icon: Trophy,
    badge: "Timed Quiz",
    badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/25",
  },
  {
    name: "AI Tutor Chat",
    href: "/chat",
    icon: Bot,
    badge: "GPT-4o",
    badgeClass: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/25",
  },
  {
    name: "YouTube AI Study",
    href: "/lecture",
    icon: Play,
    badge: "AI Study",
    badgeClass: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/25",
  },
  {
    name: "Upload Center",
    href: "/upload",
    icon: UploadCloud,
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

  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFocusOpen, setIsFocusOpen] = useState(false);

  // Real data state
  const [realStorage, setRealStorage] = useState<{
    usedDisplay: string;
    totalDisplay: string;
    percent: number;
    isDrive: boolean;
  }>({
    usedDisplay: "0 MB",
    totalDisplay: "15 GB",
    percent: 0,
    isDrive: false,
  });

  const [realTokens, setRealTokens] = useState<{
    used: number;
    total: number;
    percent: number;
    display: string;
  }>({
    used: 0,
    total: 1000000,
    percent: 0,
    display: "0 / 1M Free Tokens",
  });

  const [activeModelName, setActiveModelName] = useState<string>("Gemini 2.5 Flash");

  useEffect(() => {
    // 1. User Profile Sync
    if (user) {
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Student User';
      const emailStr = user.email || 'student@campus.edu';
      const handleStr = `@${emailStr.split('@')[0]}`;
      const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
      const colStr = user.user_metadata?.college || 'R. C. Patel Institute of Technology, Shirpur (RCPIT)';
      const deptStr = user.user_metadata?.department || 'Computer Engineering';
      const semStr = user.user_metadata?.semester || 'Semester 6';

      setUserProfile({
        name: fullName,
        email: emailStr,
        username: handleStr,
        avatarUrl,
        college: colStr,
        branch: deptStr,
        department: deptStr,
        year: user.user_metadata?.currentYear || '3rd Year',
        semester: semStr,
        activeCohort: `${colStr.split(' ')[0]} • ${deptStr.split(' ')[0]}`,
      });
    } else {
      try {
        const stored = localStorage.getItem("exambuddy_cohort_user") || localStorage.getItem("exam_buddy_user_profile");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.email) {
            setUserProfile({
              ...MOCK_USER,
              name: parsed.name || parsed.full_name || 'Student',
              email: parsed.email,
              username: `@${parsed.email.split('@')[0]}`,
              avatarUrl: parsed.avatarUrl || parsed.avatar,
              college: parsed.college || MOCK_USER.college,
              branch: parsed.department || parsed.branch || MOCK_USER.branch,
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Real Storage: Check Google Drive BYOS Quota or Local Documents
    const syncRealStorage = async () => {
      const isDrive = isDriveConnectedInStorage();
      if (isDrive) {
        const quota = await getDriveStorageQuota();
        if (quota) {
          const pct = Math.min(100, Math.round((quota.usageGB / quota.limitGB) * 100));
          setRealStorage({
            usedDisplay: `${quota.usageGB} GB`,
            totalDisplay: `${quota.limitGB} GB`,
            percent: pct,
            isDrive: true,
          });
          return;
        }
      }

      // Calculate actual size of documents stored in localStorage
      try {
        const storedDocs = localStorage.getItem("exam_buddy_documents");
        if (storedDocs) {
          const parsed = JSON.parse(storedDocs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            let totalMb = 0;
            for (const d of parsed) {
              const s = parseFloat(d.fileSize || d.size || "1.5");
              if (!isNaN(s)) totalMb += s;
            }
            const displayMb = totalMb >= 1024 ? `${(totalMb / 1024).toFixed(1)} GB` : `${totalMb.toFixed(1)} MB`;
            const pct = Math.min(100, Math.max(1, Math.round((totalMb / (15 * 1024)) * 100)));
            setRealStorage({
              usedDisplay: displayMb,
              totalDisplay: "15 GB",
              percent: pct,
              isDrive: false,
            });
            return;
          }
        }
      } catch (e) {
        console.error(e);
      }

      setRealStorage({
        usedDisplay: "0 MB",
        totalDisplay: "15 GB",
        percent: 0,
        isDrive: false,
      });
    };

    syncRealStorage();

    // 3. Real AI Tokens Telemetry from Logger
    try {
      const summary = getAIAnalyticsSummary();
      const used = summary.totalTokensUsed || 0;
      const total = 1000000; // 1M daily free tier tokens
      const pct = Math.min(100, Math.round((used / total) * 100));
      const display = used > 0
        ? `${(used / 1000).toFixed(1)}k / 1M Tokens`
        : `0 / 1M Free Tokens`;

      setRealTokens({
        used,
        total,
        percent: pct,
        display,
      });
    } catch (e) {
      console.error(e);
    }

    // 4. Real Active AI Model from AI Service
    try {
      const provider = getActiveProvider();
      const model = getSelectedModel(provider);
      const providerNames: Record<string, string> = {
        gemini: "Gemini 2.5 Flash",
        groq: "Llama 3.3 70B",
        ollama: "Ollama Local",
        openai: "GPT-4o",
        anthropic: "Claude 3.7",
      };
      const name = providerNames[provider] || model || "Gemini 2.5 Flash";
      setActiveModelName(`${name} (Active)`);
    } catch (e) {
      setActiveModelName("Gemini 2.5 Flash (Active)");
    }
  }, [user]);

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-[var(--border-card)] bg-[var(--bg-surface)]/95 backdrop-blur-2xl text-[var(--text-primary)] transition-all duration-300 ease-in-out shadow-2xl",
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
            "flex items-center border-b border-[var(--border-card)] h-14 shrink-0",
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
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#10a37f] to-teal-600 shrink-0 shadow-md">
              <GraduationCap className="w-[18px] h-[18px] text-white" />
            </div>
            <span
              className={cn(
                "font-bold text-[15px] tracking-tight text-[var(--text-primary)]",
                isIcon && "lg:hidden"
              )}
            >
              Exam<span className="text-brand">Buddy</span>
            </span>
          </Link>

          <button
            onClick={onToggle}
            className={cn(
              "hidden lg:inline-flex p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors",
              isIcon && "lg:hidden"
            )}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>

          <button
            onClick={onToggle}
            className={cn(
              "hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors",
              isIcon && "lg:inline-flex"
            )}
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>

          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] lg:hidden"
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
              "px-3 pb-2 text-xs font-semibold text-[var(--text-muted)]",
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
                      ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-[3.5px] rounded-r-full bg-[#10a37f]" />
                  )}

                  <span className={cn("flex items-center min-w-0", isIcon ? "lg:gap-0 gap-3" : "gap-3")}>
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isActive ? "text-[#10a37f]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
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
                    <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[var(--bg-elevated)] px-2.5 py-1 text-xs text-[var(--text-primary)] border border-[var(--border-card)] opacity-0 group-hover:opacity-100 z-50 hidden lg:block shadow-lg">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className={cn("mt-auto border-t border-[var(--border-card)] p-3 space-y-3", isIcon && "lg:px-2")}>
          <div
            onClick={() => setIsProfileModalOpen(true)}
            className={cn(
              "flex items-center gap-2.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-violet-500/40 p-2.5 cursor-pointer transition-all group",
              isIcon && "lg:justify-center lg:p-2"
            )}
            title="Click to edit student profile"
          >
            {userProfile.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm border border-violet-500/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className={cn("min-w-0 flex-1", isIcon && "lg:hidden")}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate group-hover:text-violet-500 dark:group-hover:text-violet-300 transition-colors">
                  {userProfile.username}
                </p>
                <Edit2 className="w-3 h-3 text-[var(--text-muted)] group-hover:text-violet-400 transition-colors" />
              </div>
              <p className="text-[10px] text-[var(--text-secondary)] truncate">
                {userProfile.college.split(" ")[0]} • {userProfile.branch.split(" ")[0]} • {userProfile.semester}
              </p>
            </div>
          </div>

          {/* Real Storage Row (Google Drive BYOS / Local) */}
          <div className={cn(isIcon && "lg:hidden")}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <Link
                href="/upload"
                className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-cyan-400 font-medium transition-colors"
                title={realStorage.isDrive ? "Google Drive BYOS (0 MB Server)" : "Personal Knowledge Storage"}
              >
                {realStorage.isDrive ? (
                  <Cloud className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <HardDrive className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                )}
                <span>{realStorage.usedDisplay} / {realStorage.totalDisplay}</span>
              </Link>
              {realStorage.isDrive && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-400 border border-blue-500/25">
                  BYOS
                </span>
              )}
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--input-bg)] overflow-hidden border border-[var(--border-card)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${Math.max(2, realStorage.percent)}%` }}
              />
            </div>
          </div>

          {/* Real AI Tokens Telemetry */}
          <div className={cn(isIcon && "lg:hidden")}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <Link
                href="/ai-manager"
                className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-violet-400 font-medium transition-colors"
                title="AI Gateway Token Telemetry"
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
                <span>{realTokens.display}</span>
              </Link>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--input-bg)] overflow-hidden border border-[var(--border-card)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300"
                style={{ width: `${Math.max(2, realTokens.percent)}%` }}
              />
            </div>
          </div>

          {/* Real Active AI Model Engine */}
          <Link
            href="/ai-manager"
            className={cn(
              "flex items-center gap-2 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors",
              isIcon && "lg:justify-center"
            )}
            title="Configure Active AI Engine in AI Manager"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
            </span>
            <span className={cn("truncate", isIcon && "lg:hidden")}>{activeModelName}</span>
          </Link>
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
              ? "bg-violet-500/10 border-l-2 border-l-indigo-500 text-indigo-500 dark:text-indigo-300 border-indigo-500/40"
              : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border-card)]"
          )}
          title={
            nowStudying.active
              ? `Now studying — ${nowStudying.subjectName} (${formatSeconds(nowStudying.timeLeftSec)} left)`
              : "No active session — click to open Planner"
          }
        >
          <Brain className="w-4 h-4" />
          {nowStudying.active && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-black" />
          )}
        </div>
      </div>
    );
  }

  if (!nowStudying.active) {
    return (
      <div
        className="now-studying-widget mt-3 mx-3 px-3 py-3 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-elevated)] flex items-center justify-between gap-2 animate-[fadeIn_0.2s_ease-out]"
      >
        <div className="min-w-0 flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border-card)] text-[var(--text-muted)] shrink-0">
            <Brain className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Now Studying
            </div>
            <div className="text-[11px] font-medium text-[var(--text-secondary)]">No active session</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push("/planner")}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold transition-colors shrink-0 shadow-sm"
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
      className="now-studying-widget mt-3 mx-3 px-3 py-3 rounded-2xl border border-violet-500/30 border-l-4 border-l-violet-500 bg-[var(--bg-elevated)] relative overflow-hidden animate-[fadeIn_0.2s_ease-out]"
    >
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
              <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 ring-2 ring-black" />
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              ◉ LIVE · {nowStudying.mode === "focus" ? "Focus" : nowStudying.mode === "shortBreak" ? "Short Break" : "Long Break"}
            </div>
            <div className="text-sm font-bold text-[var(--text-primary)] truncate">
              {nowStudying.subjectName}
              <span className="text-[10px] font-mono ml-1 text-violet-600 dark:text-violet-300">
                {nowStudying.subjectCode}
              </span>
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] truncate">{nowStudying.unitTitle}</div>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Remaining
          </span>
          <span className="font-mono text-base font-black text-[var(--text-primary)] leading-none mt-0.5">
            {String(mins).padStart(2, "0")}
            <span className="text-violet-500 dark:text-violet-300">:</span>
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
