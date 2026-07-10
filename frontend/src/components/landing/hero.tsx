import {
  ArrowRight,
  Sparkles,
  Star,
  Send,
  FileText,
  CalendarDays,
  Flame,
  CheckCircle2,
  BrainCircuit,
} from "lucide-react";
import { Reveal } from "@/components/landing/reveal";

const chat = [
  {
    role: "user" as const,
    text: "Explain the Krebs cycle and quiz me on it.",
  },
  {
    role: "ai" as const,
    text: "The Krebs cycle is an 8-step reaction that generates ATP from acetyl-CoA. Here's a quick 3-question quiz to lock it in \u2014 ready?",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* aurora background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-aurora absolute -top-32 left-1/2 h-[440px] w-[560px] -translate-x-1/2 rounded-full bg-primary/25 blur-[150px]" />
        <div className="animate-aurora absolute -top-10 right-[8%] h-[320px] w-[320px] rounded-full bg-accent/15 blur-[130px] [animation-delay:-6s]" />
        <div className="animate-aurora absolute top-40 left-[6%] h-[300px] w-[300px] rounded-full bg-primary/10 blur-[120px] [animation-delay:-12s]" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.045]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, black 35%, transparent 100%)",
        }}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 pb-10 pt-20 text-center sm:px-8 sm:pt-28">
        <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Now with AI-generated study plans
        </div>

        <h1
          className="animate-fade-up mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
          style={{ animationDelay: "60ms" }}
        >
          Your personal AI study partner for{" "}
          <span className="text-gradient">every exam</span>
        </h1>

        <p
          className="animate-fade-up mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          style={{ animationDelay: "120ms" }}
        >
          Exam Buddy turns your notes into flashcards, quizzes, and a
          personalized plan &mdash; then coaches you through every subject until
          exam day.
        </p>

        <div
          className="animate-fade-up mt-8 flex flex-col items-center gap-3 sm:flex-row"
          style={{ animationDelay: "180ms" }}
        >
          <a
            href="#cta"
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-primary/40"
          >
            Start studying free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#how-it-works"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card/60 px-6 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-muted"
          >
            See how it works
          </a>
        </div>

        <div
          className="animate-fade-up mt-8 flex flex-col items-center gap-2 text-sm text-muted-foreground sm:flex-row sm:gap-4"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-accent text-accent"
                aria-hidden
              />
            ))}
          </div>
          <span>Loved by 50,000+ students worldwide</span>
        </div>
      </div>

      {/* hero showcase */}
      <Reveal className="relative mx-auto mt-6 w-full max-w-5xl px-5 pb-24 sm:px-8" delay={120}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-8 h-56 rounded-full bg-primary/20 blur-[130px]"
        />

        {/* floating glass cards */}
        <div className="animate-float absolute -left-2 top-16 z-20 hidden w-52 rounded-xl glass p-3 shadow-xl lg:block">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Flame className="h-3.5 w-3.5" />
            </span>
            12-day streak
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            You&apos;re on fire. Keep it going to beat your record of 15 days.
          </p>
        </div>

        <div className="animate-float-slower absolute -right-3 top-8 z-20 hidden w-56 rounded-xl glass p-3 shadow-xl lg:block">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 font-medium">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              Next exam
            </span>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
              6 days
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Biology Final &middot; 78% ready. AI suggests 2 more sessions.
          </p>
        </div>

        <div className="animate-float-slower absolute -right-4 bottom-24 z-20 hidden w-44 rounded-xl glass p-3 shadow-xl lg:block [animation-delay:-3s]">
          <div className="flex items-center gap-2 text-xs font-medium">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            Quiz passed
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Organic Chemistry &middot; 9/10
          </p>
        </div>

        {/* main window: AI tutor chat */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
            <span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
            <span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
            <div className="ml-3 flex items-center gap-2 text-xs text-muted-foreground">
              <BrainCircuit className="h-3.5 w-3.5 text-primary" />
              Exam Buddy &middot; AI Tutor
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="animate-glow h-2 w-2 rounded-full bg-accent" />
              Online
            </span>
          </div>

          <div className="grid gap-0 sm:grid-cols-[1fr_240px]">
            {/* chat column */}
            <div className="flex flex-col gap-4 p-5 sm:p-6">
              {chat.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-left text-sm leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm border border-border bg-background text-foreground"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {/* typing indicator */}
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border bg-background px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                </div>
              </div>

              {/* input */}
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 text-left text-sm text-muted-foreground">
                  Ask about your notes&hellip;
                  <span className="animate-blink ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-foreground align-middle" />
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Send className="h-4 w-4" />
                </span>
              </div>
            </div>

            {/* side rail: sources */}
            <aside className="hidden flex-col gap-3 border-l border-border bg-background/50 p-5 sm:flex">
              <p className="text-xs font-medium text-muted-foreground">
                Studying from
              </p>
              {[
                { name: "Biology_Ch7.pdf", meta: "24 pages" },
                { name: "Lecture_notes.md", meta: "Highlighted" },
                { name: "Krebs_diagram.png", meta: "Image" },
              ].map((s) => (
                <div
                  key={s.name}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-2.5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="truncate text-xs font-medium">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground">{s.meta}</p>
                  </div>
                </div>
              ))}
            </aside>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
