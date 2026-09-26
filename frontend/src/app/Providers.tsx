"use client";

import { PomodoroProvider } from "@/contexts/PomodoroContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <PomodoroProvider>{children}</PomodoroProvider>;
}
