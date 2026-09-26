"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Sidebar, type SidebarState } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { FocusDock } from "@/components/focus/FocusDock";

interface AppShellProps {
  children: React.ReactNode;
}

const STUDY_ROUTE_PREFIXES = ["/planner", "/flashcards", "/subjects"];
const DOCK_EXPANDED_KEY = "exam_buddy_dock_expanded";

function isStudyRoute(pathname: string) {
  if (pathname === "/") return true;
  return STUDY_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const onStudyRoute = useMemo(() => isStudyRoute(pathname ?? "/"), [pathname]);

  const [sidebarState, setSidebarState] = useState<SidebarState>("open");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dockExpanded, setDockExpanded] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DOCK_EXPANDED_KEY) !== "0";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(DOCK_EXPANDED_KEY, dockExpanded ? "1" : "0");
    } catch {}
  }, [dockExpanded]);

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

  const toggleFocusDock = () => setDockExpanded((v) => !v);

  const showDock = onStudyRoute && dockExpanded;

  return (
    <div className="relative min-h-screen bg-[#0C0C14] text-[#F1F1F8] selection:bg-violet-500/30 selection:text-violet-100">
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
          sidebarState === "hidden" && "lg:pl-0",
          showDock && "lg:pr-80"
        )}
      >
        <Header
          onToggleSidebar={toggleFromHeader}
          onToggleFocusDock={onStudyRoute ? toggleFocusDock : undefined}
          focusDockExpanded={showDock}
        />

        <div className="flex flex-1 w-full">
          <main
            className={cn(
              "flex-1 p-4 sm:p-6 lg:p-8 transition-[max-width] duration-300 ease-in-out",
              onStudyRoute ? "max-w-none w-full" : "max-w-7xl mx-auto w-full"
            )}
          >
            {children}
          </main>
        </div>
      </div>

      {showDock && (
        <div className="hidden lg:block fixed top-16 right-0 z-20 animate-[fadeIn_0.25s_ease-out]">
          <FocusDock />
        </div>
      )}
    </div>
  );
}
