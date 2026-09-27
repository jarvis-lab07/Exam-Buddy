"use client";

import { PomodoroProvider } from "@/contexts/PomodoroContext";
import { AuthProvider } from "@/contexts/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PomodoroProvider>{children}</PomodoroProvider>
    </AuthProvider>
  );
}

