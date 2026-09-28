"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "dark" | "light" | "nature";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
});

const THEME_STORAGE_KEY = "exam_buddy_theme_mode";

function applyThemeToDocument(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", mode);
  document.documentElement.classList.remove("dark", "light", "nature");
  if (mode === "dark") {
    document.documentElement.classList.add("dark");
  } else if (mode === "light") {
    document.documentElement.classList.add("light");
  } else if (mode === "nature") {
    document.documentElement.classList.add("nature", "dark");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (saved && (saved === "dark" || saved === "light" || saved === "nature")) {
        setThemeState(saved);
        applyThemeToDocument(saved);
      } else {
        applyThemeToDocument("dark");
      }
    } catch {
      applyThemeToDocument("dark");
    }
  }, []);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.error(e);
    }
    applyThemeToDocument(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
