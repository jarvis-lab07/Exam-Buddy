import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Exam-Buddy — Smart AI-Powered Engineering Exam Companion",
  description:
    "AI-driven study companion for engineering students. Spaced repetition, syllabus mastery, interactive flashcards, and instant doubt solving.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0C0C14] text-[#F1F1F8] selection:bg-violet-500/30 selection:text-violet-100">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
