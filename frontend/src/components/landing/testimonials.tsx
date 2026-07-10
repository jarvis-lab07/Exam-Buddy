import { Star } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";

const testimonials = [
  {
    quote:
      "Exam Buddy turned my messy lecture notes into flashcards in seconds. I went from a C to an A- in one semester.",
    name: "Maya Patel",
    role: "Pre-med, Stanford",
    initials: "MP",
  },
  {
    quote:
      "The personalized study plan is a game changer. It told me exactly what to review each day before finals.",
    name: "Daniel Kim",
    role: "CS major, MIT",
    initials: "DK",
  },
  {
    quote:
      "I used to waste hours making quizzes. Now the AI does it and the explanations are genuinely better than my TA's.",
    name: "Sofia Alvarez",
    role: "Law student, NYU",
    initials: "SA",
  },
  {
    quote:
      "Spaced repetition finally clicked for me. My retention before the MCAT was the best it has ever been.",
    name: "James Carter",
    role: "Biology, UC Berkeley",
    initials: "JC",
  },
  {
    quote:
      "The AI tutor answers at 2am when nobody else will. It genuinely feels like having a study partner.",
    name: "Aisha Rahman",
    role: "Nursing, U of Toronto",
    initials: "AR",
  },
  {
    quote:
      "Clean, fast, and it actually understands my textbook. Exam Buddy is now the first app I open to revise.",
    name: "Lucas Meyer",
    role: "Economics, LSE",
    initials: "LM",
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="scroll-mt-20 border-y border-border bg-card/40 py-20 sm:py-28"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">Testimonials</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Students love studying with Exam Buddy
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal
              as="figure"
              key={t.name}
              delay={(i % 3) * 90}
              className="flex flex-col rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
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
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {t.initials}
                </span>
                <span>
                  <span className="block text-sm font-medium">{t.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {t.role}
                  </span>
                </span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
