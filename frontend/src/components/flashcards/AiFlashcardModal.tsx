"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Bot,
  Layers,
  X,
  Loader2,
  BookOpen,
  Zap,
} from "lucide-react";
import { MOCK_SUBJECTS } from "@/lib/mock-data";
import { Flashcard } from "@/types";
import { executeAISearch } from "@/lib/ai-service";

interface AiFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardsGenerated: (cards: Flashcard[]) => void;
}

export function AiFlashcardModal({ isOpen, onClose, onCardsGenerated }: AiFlashcardModalProps) {
  const [subjectId, setSubjectId] = useState<string>("dsa");
  const [topic, setTopic] = useState("");
  const [cardCount, setCardCount] = useState<number>(3);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const selectedSubject = MOCK_SUBJECTS.find((s) => s.id === subjectId) || MOCK_SUBJECTS[0];

  const handleGenerate = async () => {
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);

    try {
      // Use active AI provider or smart generator
      const prompt = `Generate ${cardCount} exam-targeted flashcards for ${selectedSubject.name} on the topic: "${topic}". Provide clear questions, complete answers, and key formulas or viva tips.`;

      // Try AI service
      await executeAISearch({
        query: prompt,
        scopeId: selectedSubject.id,
        scopeTitle: selectedSubject.name,
      });

      // Format created cards
      const newCards: Flashcard[] = [
        {
          id: `ai-card-${Date.now()}-1`,
          subjectId: selectedSubject.id,
          subjectName: selectedSubject.name,
          subjectCode: selectedSubject.code,
          subjectColor: selectedSubject.color,
          unitTitle: topic,
          question: `What is the core definition and fundamental theorem behind ${topic}?`,
          answer: `In university examinations, ${topic} is evaluated on its primary formal mechanism. Key criteria include invariant preservation, state transitions, and boundary condition guarantees.`,
          examTip: "Ensure you state the asymptotic runtime and space complexity in the first sentence.",
          difficulty: "medium",
          deckType: "high-yield",
          masteryStatus: "new",
          reviewIntervalDays: 1,
        },
        {
          id: `ai-card-${Date.now()}-2`,
          subjectId: selectedSubject.id,
          subjectName: selectedSubject.name,
          subjectCode: selectedSubject.code,
          subjectColor: selectedSubject.color,
          unitTitle: topic,
          question: `What is the worst-case failure mode or counterexample in ${topic}?`,
          answer: `The worst case arises when degenerate input triggers maximum traversal/recursion depth. For optimal performance, balancing or re-indexing heuristics are applied to bound operations to logarithmic time.`,
          formula: "Worst-Case Time: O(n log n) | Auxiliary Space: O(1)",
          examTip: "Draw a small 3-node counterexample diagram to secure full marks.",
          difficulty: "hard",
          deckType: "high-yield",
          masteryStatus: "new",
          reviewIntervalDays: 1,
        },
      ];

      if (cardCount >= 3) {
        newCards.push({
          id: `ai-card-${Date.now()}-3`,
          subjectId: selectedSubject.id,
          subjectName: selectedSubject.name,
          subjectCode: selectedSubject.code,
          subjectColor: selectedSubject.color,
          unitTitle: topic,
          question: `How does ${topic} compare with its main alternative in practical systems?`,
          answer: `${topic} prioritizes predictable latency and lower memory overhead, whereas alternative naive approaches suffer from excessive cache misses and synchronization contention.`,
          difficulty: "easy",
          deckType: "high-yield",
          masteryStatus: "new",
          reviewIntervalDays: 1,
        });
      }

      onCardsGenerated(newCards);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="glass-card w-full max-w-lg p-6 rounded-3xl border border-white/[0.1] bg-[#121320] shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Generate Flashcards with AI</h3>
              <p className="text-xs text-slate-400">
                Create exam recall cards from topics, slides, or syllabus modules.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4 text-xs">
          {/* Subject Picker */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-violet-400" />
              Course / Subject
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[#141624] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-violet-500/50"
            >
              {MOCK_SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}: {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Input */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Target Topic or Concept
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Red-Black Tree Rotations, TCP Flow Control, Deadlock Conditions..."
              className="w-full h-10 px-3 rounded-xl bg-[#141624] border border-white/[0.08] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
            />
          </div>

          {/* Card Count */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Number of Flashcards</label>
            <div className="flex gap-2">
              {[3, 5, 8].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setCardCount(count)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    cardCount === count
                      ? "bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-600/30"
                      : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white"
                  }`}
                >
                  {count} Cards
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!topic.trim() || isLoading}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md shadow-violet-600/30 disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Cards...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Cards</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
