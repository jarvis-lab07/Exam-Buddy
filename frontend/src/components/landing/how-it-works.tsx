import { Upload, Wand2, GraduationCap } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload your material",
    description:
      "Drop in lecture notes, a textbook chapter, or a PDF. Exam Buddy reads and understands it in seconds.",
  },
  {
    icon: Wand2,
    step: "02",
    title: "Let AI build your set",
    description:
      "We generate flashcards, quizzes, and a tailored study plan based on your exam date and goals.",
  },
  {
    icon: GraduationCap,
    step: "03",
    title: "Study and ace it",
    description:
      "Practice with spaced repetition, track your mastery, and walk into your exam fully prepared.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-y border-border bg-card/40 py-20 sm:py-28"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">How it works</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            From notes to mastery in three steps
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, step, title, description }, i) => (
            <div key={step} className="relative">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-sm text-muted-foreground">
                    {step}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-medium tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div
                  aria-hidden
                  className="absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-border md:block"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
