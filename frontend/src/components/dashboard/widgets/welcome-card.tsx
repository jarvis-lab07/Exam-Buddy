import { Award, Flame, Target, TrendingUp } from "lucide-react";

const stats = [
  { label: "Day streak", value: "24", icon: Flame, accent: "#f5a524" },
  { label: "Study hours", value: "23.3", icon: TrendingUp, accent: "#38d6c4" },
  { label: "Avg. score", value: "84%", icon: Target, accent: "#4f8cff" },
  { label: "Badges", value: "12", icon: Award, accent: "#8b7cf6" },
];

export function WelcomeCard() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
      <div
        aria-hidden
        className="animate-aurora pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-[90px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div className="relative flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Good afternoon, Aditya</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            You&apos;re on a{" "}
            <span className="text-gradient">24-day streak</span> — keep it going
          </h1>
          <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            You have 3 tasks left today and a Physics mock test scheduled. Your
            AI tutor has prepared a focused revision plan.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Resume studying
            </button>
            <button
              type="button"
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              View today&apos;s plan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[420px]">
          {stats.map(({ label, value, icon: Icon, accent }) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-background/60 p-4 transition-transform hover:-translate-y-0.5"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `${accent}1f`,
                  color: accent,
                }}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <p className="mt-3 text-xl font-semibold tracking-tight">
                {value}
              </p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
