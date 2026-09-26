"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Layers,
  Sparkles,
  RotateCw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Flame,
  CheckCircle2,
  Trophy,
  Brain,
  Zap,
} from "lucide-react";
import { Flashcard3D } from "@/components/flashcards/Flashcard3D";
import { AiFlashcardModal } from "@/components/flashcards/AiFlashcardModal";
import { MOCK_FLASHCARDS, MOCK_FLASHCARD_DECKS } from "@/lib/mock-data";
import { Flashcard, FlashcardDeck } from "@/types";

export default function FlashcardsPage() {
  const [allCards, setAllCards] = useState<Flashcard[]>(MOCK_FLASHCARDS);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [sessionMasteredCount, setSessionMasteredCount] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // Load from localStorage if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem("exam_buddy_flashcards");
      if (stored) {
        setAllCards(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Filter cards by selected deck
  const activeDeckCards = allCards.filter((card) => {
    if (selectedDeckId === "all") return true;
    if (selectedDeckId === "deck-mistakes") return card.deckType === "mistake-notebook";
    const deck = MOCK_FLASHCARD_DECKS.find((d) => d.id === selectedDeckId);
    return deck ? card.subjectId === deck.subjectId : true;
  });

  const currentCard = activeDeckCards[currentIndex] || activeDeckCards[0];

  const handleNext = useCallback(() => {
    if (currentIndex < activeDeckCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsSessionComplete(true);
    }
  }, [currentIndex, activeDeckCards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsSessionComplete(false);
    }
  }, [currentIndex]);

  const handleShuffle = () => {
    const shuffled = [...activeDeckCards].sort(() => Math.random() - 0.5);
    setAllCards((prev) => {
      // keep other cards and replace active ones
      const others = prev.filter((c) => !activeDeckCards.some((ac) => ac.id === c.id));
      return [...shuffled, ...others];
    });
    setCurrentIndex(0);
    setIsSessionComplete(false);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsSessionComplete(false);
  };

  const handleRateCard = (rating: "again" | "hard" | "good" | "easy") => {
    if (rating === "good" || rating === "easy") {
      setSessionMasteredCount((prev) => prev + 1);
    }

    // Update card mastery in list
    setAllCards((prev) => {
      const updated = prev.map((c) => {
        if (c.id === currentCard.id) {
          return {
            ...c,
            masteryStatus: rating === "again" ? ("new" as const) : ("mastered" as const),
            lastReviewed: "Just now",
          };
        }
        return c;
      });
      try {
        localStorage.setItem("exam_buddy_flashcards", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    handleNext();
  };

  const handleAddGeneratedCards = (newCards: Flashcard[]) => {
    setAllCards((prev) => {
      const updated = [...newCards, ...prev];
      try {
        localStorage.setItem("exam_buddy_flashcards", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    setCurrentIndex(0);
    setIsSessionComplete(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  const activeDeckMeta = MOCK_FLASHCARD_DECKS.find((d) => d.id === selectedDeckId);
  const masteredInDeck = activeDeckCards.filter((c) => c.masteryStatus === "mastered").length;
  const progressPercent = activeDeckCards.length > 0 ? Math.round((masteredInDeck / activeDeckCards.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-3xl border border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Smart Active Recall Deck
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25">
                SM-2 Spaced Repetition
              </span>
            </h1>
            <p className="text-sm text-[#9B99B5]">
              Flip through high-yield definitions, formula derivations, and common exam viva traps.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAiModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-violet-600/30 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate with AI</span>
        </button>
      </div>

      {/* Deck Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => {
            setSelectedDeckId("all");
            setCurrentIndex(0);
            setIsSessionComplete(false);
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedDeckId === "all"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
              : "bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.05]"
          }`}
        >
          All Cards ({allCards.length})
        </button>

        {MOCK_FLASHCARD_DECKS.map((deck) => (
          <button
            key={deck.id}
            type="button"
            onClick={() => {
              setSelectedDeckId(deck.id);
              setCurrentIndex(0);
              setIsSessionComplete(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              selectedDeckId === deck.id
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.05]"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: deck.color }}
            />
            <span>{deck.title}</span>
          </button>
        ))}
      </div>

      {/* Mastery & Deck Progress Bar */}
      <div className="glass-card p-4 rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white">
            Card {activeDeckCards.length > 0 ? currentIndex + 1 : 0} of {activeDeckCards.length}
          </span>
          <div className="w-32 h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-slate-400 font-mono">{progressPercent}% Mastered</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShuffle}
            className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            title="Shuffle Deck"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shuffle</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            title="Reset Deck"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Flashcard 3D Area / Session Complete State */}
      {isSessionComplete ? (
        <div className="glass-card p-10 rounded-3xl border border-emerald-500/30 text-center space-y-5 bg-gradient-to-b from-emerald-500/10 to-transparent">
          <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400 w-fit mx-auto border border-emerald-500/30">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Study Deck Completed! 🎉</h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              You reviewed all {activeDeckCards.length} cards in this deck. Spaced repetition intervals have been updated.
            </p>
          </div>

          <div className="grid grid-cols-2 max-w-xs mx-auto gap-3 text-center text-xs">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-slate-400">Mastered Today</span>
              <p className="text-lg font-bold text-emerald-400 mt-1">+{sessionMasteredCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-slate-400">Total Deck</span>
              <p className="text-lg font-bold text-white mt-1">{activeDeckCards.length} cards</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-violet-600/30 transition-all"
            >
              <RotateCw className="w-4 h-4" />
              <span>Review Deck Again</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedDeckId("all")}
              className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold transition-all"
            >
              Explore Other Decks
            </button>
          </div>
        </div>
      ) : activeDeckCards.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-white/[0.08] text-center space-y-4">
          <p className="text-white font-bold">No flashcards in this deck</p>
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold"
          >
            Generate with AI
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* The 3D Flip Card */}
          <Flashcard3D card={currentCard} onRate={handleRateCard} />

          {/* Navigation Controls */}
          <div className="flex items-center justify-between max-w-2xl mx-auto px-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-[11px] text-slate-500 font-mono">
              Use ← and → arrow keys to navigate
            </span>

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <span>{currentIndex === activeDeckCards.length - 1 ? "Complete" : "Next"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* AI Generator Modal */}
      <AiFlashcardModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onCardsGenerated={handleAddGeneratedCards}
      />
    </div>
  );
}
