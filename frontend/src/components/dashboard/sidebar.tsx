"use client";

import { BookOpenCheck, ChevronRight, Sparkles, X } from "lucide-react";
import { navItems } from "@/components/dashboard/data";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform duration-300 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-5">
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
              <BookOpenCheck className="h-5 w-5" />
            </span>
            <span className="text-base font-semibold tracking-tight">
              Exam Buddy
            </span>
          </a>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <p className="px-3 pb-2 pt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Workspace
          </p>
          <ul className="flex flex-col gap-1">
            {navItems.map(({ label, icon: Icon, badge, active }) => (
              <li key={label}>
                <a
                  href="#"
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-primary/10 font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 ${
                      active ? "text-primary" : ""
                    }`}
                  />
                  <span className="flex-1">{label}</span>
                  {badge ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                      {badge}
                    </span>
                  ) : null}
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Upgrade card */}
        <div className="px-3 pb-3">
          <div className="glass relative overflow-hidden rounded-xl p-4">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent/20 blur-2xl"
            />
            <div className="relative">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <Sparkles className="h-4 w-4" />
              </span>
              <p className="mt-3 text-sm font-medium">Upgrade to Pro</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Unlimited AI tutoring, mock tests, and PDF analysis.
              </p>
              <button
                type="button"
                className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Upgrade
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* User profile */}
        <div className="border-t border-border p-3">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-foreground">
              AK
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                Aditya Kumar
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                Grade 12 · Science
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </div>
      </aside>
    </>
  );
}
