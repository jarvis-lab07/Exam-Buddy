import {
  LayoutDashboard,
  Layers,
  ListChecks,
  MessageSquareText,
  Settings,
  Flame,
  TrendingUp,
} from "lucide-react";

const topics = [
  { name: "Organic Chemistry", mastery: 86 },
  { name: "Cell Biology", mastery: 72 },
  { name: "Thermodynamics", mastery: 64 },
  { name: "Linear Algebra", mastery: 48 },
];

const sidebar = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: Layers, label: "Flashcards" },
  { icon: ListChecks, label: "Quizzes" },
  { icon: MessageSquareText, label: "AI Tutor" },
  { icon: Settings, label: "Settings" },
];

export function DashboardPreview() {
  return (
    <section id="preview" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">Dashboard</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Your entire study life, in one place
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            A clean, focused workspace that shows exactly what to study next.
          </p>
        </div>

        <div className="relative mt-14">
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

            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
              {/* sidebar */}
              <aside className="hidden flex-col gap-1 border-r border-border p-4 md:flex">
                {sidebar.map(({ icon: Icon, label, active }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </div>
                ))}
              </aside>

              {/* main */}
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      Good evening, Alex
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Biology final in 6 days
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
                    <Flame className="h-4 w-4 text-accent" />
                    <span className="font-medium">12-day streak</span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    { label: "Cards due", value: "48" },
                    { label: "Avg. score", value: "91%" },
                    { label: "Study time", value: "4.2h" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-border bg-background p-4"
                    >
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-2xl font-semibold tracking-tight">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Topic mastery</h4>
                    <span className="inline-flex items-center gap-1 text-xs text-accent">
                      <TrendingUp className="h-3.5 w-3.5" />
                      +8% this week
                    </span>
                  </div>
                  <div className="mt-4 flex flex-col gap-3">
                    {topics.map((topic) => (
                      <div key={topic.name}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {topic.name}
                          </span>
                          <span className="font-medium">{topic.mastery}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${topic.mastery}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
