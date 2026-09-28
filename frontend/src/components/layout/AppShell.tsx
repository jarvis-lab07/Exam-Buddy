"use client";

import React, { useEffect, useState } from "react";
import { Sidebar, type SidebarState } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";
import { FocusDock } from "@/components/focus/FocusDock";
import { X } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

const DOCK_EXPANDED_KEY = "exam_buddy_dock_expanded";

export function AppShell({ children }: AppShellProps) {
  const [sidebarState, setSidebarState] = useState<SidebarState>("open");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dockExpanded, setDockExpanded] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DOCK_EXPANDED_KEY);
      if (stored === "1") setDockExpanded(true);
    } catch {}
  }, []);

  const toggleFocusDock = () => {
    setDockExpanded((v) => {
      const next = !v;
      try {
        localStorage.setItem(DOCK_EXPANDED_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  const cycleDesktopSidebar = () => {
    setSidebarState((current) => {
      if (current === "open") return "icon";
      if (current === "icon") return "hidden";
      return "open";
    });
  };

  const toggleFromHeader = () => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
      cycleDesktopSidebar();
      return;
    }
    setMobileOpen((open) => !open);
  };

  const toggleFromSidebar = () => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
      setSidebarState((current) => (current === "open" ? "icon" : "open"));
      return;
    }
    setMobileOpen(false);
  };

  return (
    <div className="relative min-h-screen text-theme-primary selection:bg-violet-500/30 selection:text-violet-100">
      <div className="ambient-glow" />

      <Sidebar
        state={sidebarState}
        onToggle={toggleFromSidebar}
        isMobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          "flex flex-col min-h-screen relative z-10 transition-[padding] duration-300 ease-in-out",
          sidebarState === "open" && "lg:pl-64",
          sidebarState === "icon" && "lg:pl-16",
          sidebarState === "hidden" && "lg:pl-0"
        )}
      >
        <Header
          onToggleSidebar={toggleFromHeader}
          onToggleFocusDock={toggleFocusDock}
          focusDockExpanded={dockExpanded}
        />

        <div className="flex flex-1 w-full">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-none w-full transition-all duration-300 ease-in-out">
            {children}
          </main>
        </div>
      </div>

      {/* Floating Focus Hub Drawer (Does NOT compress main workspace) */}
      {dockExpanded && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
            onClick={toggleFocusDock}
          />
          <div className="fixed top-16 right-4 z-50 w-80 sm:w-88 animate-in slide-in-from-right-4 duration-200 shadow-2xl rounded-2xl overflow-hidden border border-white/[0.12] bg-[var(--bg-elevated)]/95 backdrop-blur-2xl">
            <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.04] border-b border-white/[0.08]">
              <span className="text-xs font-bold text-theme-primary uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                Focus Hub Drawer
              </span>
              <button
                type="button"
                onClick={toggleFocusDock}
                className="p-1 rounded-lg text-theme-muted hover:text-white hover:bg-white/[0.08]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 max-h-[calc(100vh-100px)] overflow-y-auto">
              <FocusDock />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
