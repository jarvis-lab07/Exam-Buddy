import {
  LayoutDashboard,
  Layers,
  ListChecks,
  MessageSquareText,
  CalendarDays,
  FileText,
  Settings,
  Flame,
  TrendingUp,
  Search,
  Sparkles,
  Send,
  Clock,
  ArrowUpRight,
  FlaskConical,
  Dna,
  Sigma,
  Atom,
} from "lucide-react";
import { Reveal } from "@/components/landing/reveal";

const sidebar = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: Layers, label: "Flashcards" },
  { icon: ListChecks, label: "Quizzes" },
  { icon: CalendarDays, label: "Planner" },
  { icon: FileText, label: "Documents" },
  { icon: MessageSquareText, label: "AI Tutor" },
  { icon: Settings, label: "Settings" },
];

const subjects = [
  { name: "Organic Chemistry", icon: FlaskConical, mastery: 86, hue: "primary" },
  { name: "Cell Biology", icon: Dna, mastery: 72, hue: "accent" },
  { name: "Linear Algebra", icon: Sigma, mastery: 48, hue: "primary" },
  { name: "Thermodynamics", icon: Atom, mastery: 64, hue: "accent" },
];

const planner = [
  { task: "Review Krebs cycle flashcards", time: "20 min", done: true },
  { task: "Practice quiz: Chapter 7", time: "15 min", done: true },
  { task: "Read lecture notes \u2014 Enzymes", time: "30 min", done: false },
  { task: "AI recap: weak topics", time: "10 min", done: false },
];

const exams = [
  { name: "Biology Final", days: 6, ready: 78 },
  { name: "Chemistry Midterm", days: 12, ready: 64 },
  { name: "Calculus Quiz", days: 18, ready: 41 },
];

const weekActivity = [40, 65, 52, 80, 72, 95, 60];
const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
const calDays = Array.from({ length: 30 }, (_, i) => i + 1);
const examDays = new Set([9, 15, 21]);

export function DashboardPreview() {
  return (
    <section id="preview" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">
            The workspace
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Every study tool, in one focused place
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Chat with your AI tutor, track subjects, plan sessions, and analyze
            your notes &mdash; without jumping between five different apps.
          </p>
        </Reveal>

        <Reveal className="relative mt-14" delay={100}>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10 -top-10 h-40 rounded-full bg-primary/20 blur-[120px]"
          />
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            {/* window bar */}
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
              <span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
              <span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
              <span className="ml-3 text-xs text-muted-foreground">
                exambuddy.app/dashboard
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[210px_1fr]">
              {/* sidebar */}
              <aside className="hidden flex-col gap-1 border-r border-border p-4 md:flex">
                <div className="mb-3 flex items-center gap-2 px-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-semibold">Exam Buddy</span>
                </div>
                {sidebar.map(({ icon: Icon, label, active }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </div>
                ))}
              </aside>

              {/* main */}
              <div className="p-4 sm:p-6">
                {/* header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      Good evening, Alex
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      You have 2 sessions planned for today
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="hidden items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground sm:flex">
                      <Search className="h-4 w-4" />
                      Search notes
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
                      <Flame className="h-4 w-4 text-accent" />
                      <span className="font-medium">12</span>
                    </div>
                  </div>
                </div>

                {/* bento grid */}
                <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
                  {/* Subject cards */}
                  <div className="rounded-xl border border-border bg-background p-4 lg:col-span-2">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-medium">Your subjects</h4>
                      <span className="inline-flex items-center gap-1 text-xs text-accent">
                        <TrendingUp className="h-3.5 w-3.5" />
                        +8% this week
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {subjects.map((s) => {
                        const Icon = s.icon;
                        const isAccent = s.hue === "accent";
                        return (
                          <div
                            key={s.name}
                            className="group rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`flex h-8 w-8 items-center justify-center rounded-md ${
                                  isAccent
                                    ? "bg-accent/15 text-accent"
                                    : "bg-primary/15 text-primary"
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="truncate text-xs font-medium">
                                {s.name}
                              </span>
                            </div>
                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full ${isAccent ? "bg-accent" : "bg-primary"}`}
                                style={{ width: `${s.mastery}%` }}
                              />
                            </div>
                            <p className="mt-1.5 text-[11px] text-muted-foreground">
                              {s.mastery}% mastery
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Progress analytics */}
                  <div className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Weekly focus</h4>
                      <span className="text-xs text-muted-foreground">
                        4.2h
                      </span>
                    </div>
                    <div className="mt-4 flex h-28 items-end justify-between gap-1.5">
                      {weekActivity.map((v, i) => (
                        <div
                          key={i}
                          className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                        >
                          <div
                            className={`w-full rounded-t-sm transition-all ${i === 5 ? "bg-primary" : "bg-primary/30"}`}
                            style={{ height: `${v}%` }}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {weekDays[i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Study planner */}
                  <div className="rounded-xl border border-border bg-background p-4 lg:col-span-2">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-medium">Today&apos;s plan</h4>
                      <span className="text-xs text-muted-foreground">
                        2 of 4 done
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {planner.map((p) => (
                        <div
                          key={p.task}
                          className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                              p.done
                                ? "border-accent bg-accent/15 text-accent"
                                : "border-border text-transparent"
                            }`}
                          >
                            <ListChecks className="h-3 w-3" />
                          </span>
                          <span
                            className={`flex-1 truncate text-xs ${
                              p.done
                                ? "text-muted-foreground line-through"
                                : "text-foreground"
                            }`}
                          >
                            {p.task}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {p.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Calendar */}
                  <div className="rounded-xl border border-border bg-background p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-medium">June</h4>
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                        <span
                          key={i}
                          className="text-[9px] font-medium text-muted-foreground"
                        >
                          {d}
                        </span>
                      ))}
                      {calDays.map((d) => {
                        const isExam = examDays.has(d);
                        const isToday = d === 3;
                        return (
                          <span
                            key={d}
                            className={`flex aspect-square items-center justify-center rounded-[5px] text-[10px] ${
                              isToday
                                ? "bg-primary font-semibold text-primary-foreground"
                                : isExam
                                  ? "bg-accent/20 font-medium text-accent"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {d}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* PDF analyzer */}
                  <div className="relative overflow-hidden rounded-xl border border-border bg-background p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
                        <FileText className="h-4 w-4" />
                      </span>
                      <div>
                        <h4 className="text-sm font-medium">PDF Analyzer</h4>
                        <p className="text-[11px] text-muted-foreground">
                          Biology_Ch7.pdf
                        </p>
                      </div>
                    </div>
                    <div className="animate-shimmer relative mb-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-[82%] rounded-full bg-primary" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Extracted 42 key terms &middot; generated 18 flashcards
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                      View summary
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>

                  {/* Upcoming exams */}
                  <div className="rounded-xl border border-border bg-background p-4">
                    <h4 className="mb-3 text-sm font-medium">Upcoming exams</h4>
                    <div className="flex flex-col gap-2.5">
                      {exams.map((e) => (
                        <div key={e.name} className="flex items-center gap-3">
                          <div className="flex flex-1 flex-col gap-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="truncate font-medium">
                                {e.name}
                              </span>
                              <span className="text-muted-foreground">
                                {e.days}d
                              </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-accent"
                                style={{ width: `${e.ready}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI chat */}
                  <div className="flex flex-col rounded-xl border border-primary/30 bg-gradient-to-b from-primary/[0.07] to-transparent p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <Sparkles className="h-4 w-4" />
                      </span>
                      <div>
                        <h4 className="text-sm font-medium">AI Tutor</h4>
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <span className="animate-glow h-1.5 w-1.5 rounded-full bg-accent" />
                          Ready to help
                        </span>
                      </div>
                    </div>
                    <div className="mb-3 rounded-lg rounded-tl-sm border border-border bg-card px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                      Want me to build a revision plan for your Biology final?
                    </div>
                    <div className="mt-auto flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                      <span className="flex-1 text-[11px] text-muted-foreground">
                        Ask anything&hellip;
                      </span>
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <Send className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
