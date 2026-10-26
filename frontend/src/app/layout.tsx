import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { Providers } from "./Providers";

export const metadata: Metadata = {
  title: "Exam-Buddy — Smart AI-Powered Academic Companion",
  description:
    "AI-driven study companion for students. Spaced repetition, syllabus mastery, interactive flashcards, and instant doubt solving.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem("exam_buddy_theme_mode") || "dark";
                  document.documentElement.setAttribute("data-theme", mode);
                  document.documentElement.classList.remove("dark", "light", "nature");
                  if (mode === "dark") {
                    document.documentElement.classList.add("dark");
                  } else if (mode === "light") {
                    document.documentElement.classList.add("light");
                  } else if (mode === "nature") {
                    document.documentElement.classList.add("nature", "dark");
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-base)] text-theme-primary selection:bg-emerald-500/30 selection:text-emerald-100 font-sans">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}

