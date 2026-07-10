import { ArrowRight, Sparkles, Star } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[420px] max-w-4xl rounded-full bg-primary/20 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, black 40%, transparent 100%)",
        }}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 pb-20 pt-20 text-center sm:px-8 sm:pt-28">
        <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Now with AI-generated study plans
        </div>

        <h1
          className="animate-fade-up mt-6 max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-6xl"
          style={{ animationDelay: "60ms" }}
        >
          Study smarter, not harder with{" "}
          <span className="text-primary">Exam Buddy</span>
        </h1>

        <p
          className="animate-fade-up mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          style={{ animationDelay: "120ms" }}
        >
          Turn your notes into flashcards, quizzes, and personalized study plans
          in seconds. Let AI handle the busywork so you can focus on acing every
          exam.
        </p>

        <div
          className="animate-fade-up mt-8 flex flex-col items-center gap-3 sm:flex-row"
          style={{ animationDelay: "180ms" }}
        >
          <a
            href="#cta"
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
          >
            Start studying free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#how-it-works"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
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
    </section>
  );
}
