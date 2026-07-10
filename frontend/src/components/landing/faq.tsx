"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";

const faqs = [
  {
    q: "How does Exam Buddy create study materials?",
    a: "Upload your notes, slides, or a PDF and our AI reads the content to generate flashcards, quizzes, and a study plan tailored to your material and exam date.",
  },
  {
    q: "Is my data private and secure?",
    a: "Yes. Your uploads are encrypted and only used to generate your personal study content. We never sell your data or use it to train public models.",
  },
  {
    q: "Which subjects does it support?",
    a: "Exam Buddy works across virtually any subject, from biology and chemistry to law, economics, languages, and computer science.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. Exam Buddy runs entirely in your browser and syncs across your devices, so you can study on your laptop or phone anytime.",
  },
  {
    q: "Is there a free plan?",
    a: "Absolutely. You can start for free with generous limits and upgrade only when you need unlimited generations and advanced analytics.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">FAQ</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
        </Reveal>

        <div className="mt-12 flex flex-col gap-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <Reveal
                key={faq.q}
                delay={i * 60}
                className={`rounded-xl border bg-card transition-colors ${
                  isOpen ? "border-primary/40" : "border-border hover:border-primary/20"
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
