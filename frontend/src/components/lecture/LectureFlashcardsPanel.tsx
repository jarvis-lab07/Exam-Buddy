"use client";

import React, { useState } from "react";
import { Layers, Sparkles, RotateCw, CheckCircle2 } from "lucide-react";
import { Flashcard3D } from "@/components/flashcards/Flashcard3D";
import { aiGateway } from "@/lib/ai-gateway";
import { Flashcard } from "@/types";

interface LectureFlashcardsPanelProps {
  lectureTitle: string;
}

export function LectureFlashcardsPanel({ lectureTitle }: LectureFlashcardsPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([
    {
      id: "fc-1",
      subjectId: "dsa",
      subjectName: "Data Structures",
      subjectCode: "CS301",
      subjectColor: "#6366F1",
      question: "What triggers an AVL Single Rotation vs Double Rotation?",
      answer: "Single rotation occurs when imbalance is linear (LL or RR). Double rotation (LR or RL) is required when the inserted node is on an inner grandchild branch.",
      difficulty: "medium",
      deckType: "high-yield",
      masteryStatus: "new",
    },
    {
      id: "fc-2",
      subjectId: "dsa",
      subjectName: "Data Structures",
      subjectCode: "CS301",
      subjectColor: "#6366F1",
      question: "Formula for Balance Factor in AVL Trees?",
      answer: "Balance Factor = Height(Left Subtree) - Height(Right Subtree). Must evaluate to -1, 0, or +1.",
      difficulty: "easy",
      deckType: "formulas",
      masteryStatus: "learning",
    },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleGenerateCards = async () => {
    setIsGenerating(true);
    try {
      const res = await aiGateway.execute({
        feature: "flashcards",
        messages: [
          {
            role: "system",
            content: "You are an AI flashcard creator. Output ONLY a valid JSON array of 3 flashcards. Format: [{\"question\":\"...\", \"answer\":\"...\"}]",
          },
          {
            role: "user",
            content: `Generate 3 high-yield university exam flashcards for the lecture "${lectureTitle}".`,
          },
        ],
      });

      if (res.text) {
        const jsonMatch = res.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setCards(
            parsed.map((c: any, idx: number) => ({
              id: `gen-fc-${idx}-${Date.now()}`,
              subjectId: "lecture",
              subjectName: "Lecture",
              subjectCode: "LEC",
              subjectColor: "#8B5CF6",
              question: c.question,
              answer: c.answer,
              difficulty: "medium",
              deckType: "high-yield",
              masteryStatus: "new",
            }))
          );
          setCurrentIndex(0);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentCard = cards[currentIndex] || cards[0];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-white/[0.06] pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            AI Lecture Flashcards ({currentIndex + 1} / {cards.length})
          </h3>
          <p className="text-[11px] text-[#9B99B5]">Interactive 3D flashcard study deck generated from lecture context.</p>
        </div>

        <button
          type="button"
          onClick={handleGenerateCards}
          disabled={isGenerating}
          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 fill-white" />
          {isGenerating ? "Generating..." : "Generate Cards"}
        </button>
      </div>

      {/* 3D Interactive Card Showcase */}
      {currentCard && (
        <div className="max-w-md mx-auto py-2">
          <Flashcard3D card={currentCard} onRate={() => {}} />
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between max-w-md mx-auto pt-2">
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-bold border border-white/[0.06] transition-all disabled:opacity-40"
        >
          Previous
        </button>

        <span className="text-xs font-mono text-[#9B99B5]">
          Card {currentIndex + 1} of {cards.length}
        </span>

        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => Math.min(cards.length - 1, prev + 1))}
          disabled={currentIndex === cards.length - 1}
          className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md disabled:opacity-40"
        >
          Next Card
        </button>
      </div>
    </div>
  );
}
