import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Exam Buddy — AI-Powered Study Platform",
  description:
    "Study smarter, not harder. Exam Buddy turns your notes into flashcards, quizzes, and personalized study plans with AI so you ace every exam.",
  keywords: [
    "AI study",
    "exam prep",
    "flashcards",
    "study planner",
    "quiz generator",
    "learning platform",
  ],
  openGraph: {
    title: "Exam Buddy — AI-Powered Study Platform",
    description:
      "Study smarter, not harder. Turn your notes into flashcards, quizzes, and personalized study plans with AI.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#060708",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-background`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
