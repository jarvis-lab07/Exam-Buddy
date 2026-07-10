import {
  Brain,
  CalendarClock,
  FileStack,
  LineChart,
  MessageSquareText,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: Brain,
    title: "AI flashcards",
    description:
      "Upload notes or a PDF and instantly generate smart flashcards that adapt to what you find hard.",
  },
  {
    icon: FileStack,
    title: "Auto quizzes",
    description:
      "Practice with quizzes generated from your own material, complete with detailed explanations.",
  },
  {
    icon: CalendarClock,
    title: "Personalized plans",
    description:
      "Get a day-by-day study schedule built around your exam date and available time.",
  },
  {
    icon: MessageSquareText,
    title: "AI tutor chat",
    description:
      "Ask questions in plain language and get clear, source-grounded answers 24/7.",
  },
  {
    icon: LineChart,
    title: "Progress tracking",
    description:
      "See mastery per topic and know exactly where to focus before test day.",
  },
  {
    icon: Zap,
    title: "Spaced repetition",
    description:
      "Review at the perfect moment with a proven algorithm that maximizes retention.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">Features</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to prepare with confidence
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            A complete AI study toolkit that meets you wherever you are in your
            revision.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-medium tracking-tight">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
