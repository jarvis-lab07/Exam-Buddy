"use client";

import React, { useState } from "react";
import { Sidebar, type SidebarState } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarState, setSidebarState] = useState<SidebarState>("open");
  const [mobileOpen, setMobileOpen] = useState(false);

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
          sidebarState === "hidden" && "lg:pl-0"
        )}
      >
        <Header onToggleSidebar={toggleFromHeader} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
