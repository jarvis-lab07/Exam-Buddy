"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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
  Swords,
  SlidersHorizontal,
  UploadCloud,
  GraduationCap,
  AlertCircle,
  Filter,
} from "lucide-react";
import { Flashcard3D } from "@/components/flashcards/Flashcard3D";
import { AiFlashcardModal } from "@/components/flashcards/AiFlashcardModal";
import { PeerQuizBattleModal } from "@/components/flashcards/PeerQuizBattleModal";
import { MockInterviewSetupModal } from "@/components/subjects/MockInterviewSetupModal";
import { MOCK_FLASHCARDS, MOCK_FLASHCARD_DECKS } from "@/lib/mock-data";
import { Flashcard, Subject } from "@/types";
import { getUserSubjects, isCustomSyllabusOnly } from "@/lib/subject-service";
import {
  computeMasterySummary,
  SubjectMasteryStat,
  purgeCorruptedFlashcards,
  isCorruptedQuestion,
  deleteCardsForSubject,
} from "@/lib/mock-interview-service";
import { Trash2 } from "lucide-react";

function FlashcardsContent() {
  const searchParams = useSearchParams();
  const initialSubjectParam = searchParams.get("filterSubject") || "";
  const initialDeckParam = searchParams.get("filterDeck") || "";

  const [allCards, setAllCards] = useState<Flashcard[]>(MOCK_FLASHCARDS);
  const [userSubjects, setUserSubjects] = useState<Subject[]>([]);
  const [appMode, setAppMode] = useState<"mock-interview" | "standard">(
    initialDeckParam ? "standard" : "mock-interview"
  );
  
  // Mock Interview filters
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>(initialSubjectParam || "all-random");
  const [showUnmasteredOnly, setShowUnmasteredOnly] = useState<boolean>(false);

  // Standard deck filter
  const [selectedDeckId, setSelectedDeckId] = useState<string>(initialDeckParam || "all");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isBattleModalOpen, setIsBattleModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [sessionMasteredCount, setSessionMasteredCount] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // Load dynamic subjects
  useEffect(() => {
    const loadSubjects = () => {
      const list = getUserSubjects();
      setUserSubjects(list);
    };
    loadSubjects();

    window.addEventListener("exam_buddy_subjects_updated", loadSubjects);
    return () => window.removeEventListener("exam_buddy_subjects_updated", loadSubjects);
  }, []);

  // Load flashcards from localStorage with auto-purge of corrupted cards
  const loadCards = useCallback(() => {
    try {
      // Automatically purge any raw PDF binary or corrupted cards and format existing answers
      const cleaned = purgeCorruptedFlashcards();
      if (cleaned.length > 0) {
        setAllCards(cleaned);
      } else {
        const stored = localStorage.getItem("exam_buddy_flashcards");
        if (stored) {
          const parsed: Flashcard[] = JSON.parse(stored);
          setAllCards(parsed.filter((c) => !isCorruptedQuestion(c.question) && !isCorruptedQuestion(c.answer)));
        } else if (isCustomSyllabusOnly()) {
          setAllCards([]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadCards();
    window.addEventListener("exam_buddy_flashcards_updated", loadCards);
    return () => window.removeEventListener("exam_buddy_flashcards_updated", loadCards);
  }, [loadCards]);

  // Compute Mock Interview Mastery Summary
  const masterySummary = useMemo(() => {
    return computeMasterySummary(userSubjects, allCards);
  }, [userSubjects, allCards]);

  // Determine active deck cards based on mode
  const activeDeckCards = useMemo(() => {
    if (appMode === "mock-interview") {
      let cards = allCards.filter((c) => c.isMockInterview || c.deckType === "mock-interview");

      // Filter by subject if not random
      if (selectedSubjectFilter !== "all-random") {
        cards = cards.filter((c) => c.subjectId === selectedSubjectFilter);
      }

      // Filter unmastered
      if (showUnmasteredOnly) {
        cards = cards.filter((c) => c.masteryStatus !== "mastered");
      }

      return cards;
    } else {
      return allCards.filter((card) => {
        if (selectedDeckId === "all") return true;
        if (selectedDeckId === "deck-mistakes") return card.deckType === "mistake-notebook";
        const deck = MOCK_FLASHCARD_DECKS.find((d) => d.id === selectedDeckId);
        return deck ? card.subjectId === deck.subjectId : true;
      });
    }
  }, [allCards, appMode, selectedSubjectFilter, showUnmasteredOnly, selectedDeckId]);

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

  const masteredInDeck = activeDeckCards.filter((c) => c.masteryStatus === "mastered").length;
  const progressPercent =
    activeDeckCards.length > 0 ? Math.round((masteredInDeck / activeDeckCards.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner & Mode Toggle */}
      <div className="glass-card p-6 rounded-2xl border border-white/[0.08] border-t-2 border-cyan-500/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              Oral Viva & Active Recall Deck
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                Saturday Mock Interview
              </span>
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Master your 10 shortlisted questions per subject. Drill concise spoken answers, keywords, and follow-up traps.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--border-card)]">
            <button
              type="button"
              onClick={() => {
                setAppMode("mock-interview");
                setCurrentIndex(0);
                setIsSessionComplete(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                appMode === "mock-interview"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              Mock Interview
            </button>
            <button
              type="button"
              onClick={() => {
                setAppMode("standard");
                setCurrentIndex(0);
                setIsSessionComplete(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                appMode === "standard"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              Standard Decks
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsSetupModalOpen(true)}
            className="p-2 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--border-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-card)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Configure your 5 subjects"
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">My 5 Subjects</span>
          </button>
        </div>
      </div>

      {/* MOCK INTERVIEW MASTERY RADAR & SUBJECT BREAKDOWN */}
      {appMode === "mock-interview" && (
        <div className="space-y-4">
          {/* Overall Viva Readiness Bar */}
          <div className="glass-card p-5 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                Overall Mock Interview Readiness
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[var(--text-primary)] font-mono">
                  {masterySummary.totalMastered} / {masterySummary.totalQuestions}
                </span>
                <span className="text-sm font-semibold text-emerald-500 dark:text-emerald-400">
                  ({masterySummary.overallPercentage}% Mastered)
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  • {masterySummary.totalRemaining} remaining for Saturday
                </span>
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-1.5">
              <div className="w-full h-2.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-card)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-500 rounded-full"
                  style={{ width: `${masterySummary.overallPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>0 Mastered</span>
                <span>Goal: {masterySummary.totalQuestions} Questions</span>
              </div>
            </div>
          </div>

          {/* 5-Subject Breakdown Cards */}
          {masterySummary.bySubject.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {masterySummary.bySubject.map((stat) => {
                const isSelected = selectedSubjectFilter === stat.subjectId;
                return (
                  <button
                    key={stat.subjectId}
                    type="button"
                    onClick={() => {
                      setSelectedSubjectFilter(isSelected ? "all-random" : stat.subjectId);
                      setCurrentIndex(0);
                      setIsSessionComplete(false);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                      isSelected
                        ? "bg-cyan-500/15 border-cyan-500/60 shadow-lg shadow-cyan-500/15"
                        : "bg-[var(--bg-card)] border-[var(--border-card)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: stat.subjectColor }}
                      />
                      <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold truncate">
                        {stat.subjectCode || "SUB"}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[var(--text-primary)] truncate group-hover:text-cyan-500 dark:group-hover:text-cyan-300 transition-colors">
                      {stat.subjectName}
                    </h4>

                    <div className="mt-2 flex items-baseline justify-between text-[11px]">
                      <span className="font-bold text-[var(--text-primary)] font-mono">
                        {stat.masteredCount} / {stat.totalQuestions}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {stat.remainingCount} left
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] overflow-hidden mt-1.5">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${stat.percentage}%`,
                          backgroundColor: stat.subjectColor,
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Filter Pills & Random Mode Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {/* Random All Subjects Pill */}
              <button
                type="button"
                onClick={() => {
                  setSelectedSubjectFilter("all-random");
                  setCurrentIndex(0);
                  setIsSessionComplete(false);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedSubjectFilter === "all-random"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                    : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-card)] hover:bg-[var(--bg-elevated)]"
                }`}
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Random Across All Subjects ({masterySummary.totalQuestions})</span>
              </button>

              {/* Mistake Notebook Quick Filter Pill */}
              <button
                type="button"
                onClick={() => {
                  setAppMode("standard");
                  setSelectedDeckId("deck-mistakes");
                  setCurrentIndex(0);
                  setIsSessionComplete(false);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 bg-rose-500/15 text-rose-500 dark:text-rose-300 hover:bg-rose-500/25 border border-rose-500/30"
              >
                <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
                <span>Mistake Notebook 🔥</span>
              </button>

              {/* Individual Subject Filter Pills */}
              {userSubjects.map((subj) => (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => {
                    setSelectedSubjectFilter(subj.id);
                    setCurrentIndex(0);
                    setIsSessionComplete(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    selectedSubjectFilter === subj.id
                      ? "bg-cyan-600 text-white border border-cyan-500/40"
                      : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-card)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: subj.color }}
                  />
                  <span>{subj.name}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs">
              {/* Unmastered Toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium select-none">
                <input
                  type="checkbox"
                  checked={showUnmasteredOnly}
                  onChange={(e) => {
                    setShowUnmasteredOnly(e.target.checked);
                    setCurrentIndex(0);
                    setIsSessionComplete(false);
                  }}
                  className="rounded bg-black/40 border-white/20 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-[11px] text-cyan-300">Drill Remaining Only</span>
              </label>

              <button
                type="button"
                onClick={handleShuffle}
                className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                title="Shuffle cards"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Shuffle</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                title="Reset session"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              {selectedSubjectFilter !== "all-random" && (
                <button
                  type="button"
                  onClick={() => {
                    deleteCardsForSubject(selectedSubjectFilter);
                    handleReset();
                  }}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs flex items-center gap-1 transition-colors"
                  title="Clear all cards for this subject to re-upload"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear Cards</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STANDARD DECK SELECTOR (Only shown in standard mode) */}
      {appMode === "standard" && (
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
                ? "bg-violet-600 text-white border border-violet-500/40"
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
                  ? "bg-violet-600 text-white border border-violet-500/40"
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
      )}

      {/* Active Deck Position Gauge */}
      <div className="glass-card p-3 rounded-2xl border border-[var(--border-card)] flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[var(--text-primary)]">
            Card {activeDeckCards.length > 0 ? currentIndex + 1 : 0} of {activeDeckCards.length}
          </span>
          <div className="w-28 sm:w-36 h-2 rounded-full bg-[var(--input-bg)] overflow-hidden border border-[var(--border-subtle)]">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[var(--text-muted)] font-mono hidden sm:inline">{progressPercent}% Mastered in View</span>
        </div>

        {currentCard && (
          <span
            className="px-2.5 py-0.5 rounded-md text-[10px] font-bold"
            style={{
              backgroundColor: `${currentCard.subjectColor}20`,
              color: currentCard.subjectColor,
            }}
          >
            {currentCard.subjectCode || "QUESTION"}: {currentCard.subjectName}
          </span>
        )}
      </div>

      {/* Main Flashcard 3D Area / Session Complete / Empty State */}
      {isSessionComplete ? (
        <div className="glass-card p-10 rounded-2xl border border-emerald-500/30 border-t-2 border-emerald-500/40 text-center space-y-5">
          <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400 w-fit mx-auto border border-emerald-500/30">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Oral Viva Session Completed! 🎉</h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
              You reviewed all {activeDeckCards.length} cards in this set. Your subject mastery counters have been updated!
            </p>
          </div>

          <div className="grid grid-cols-2 max-w-xs mx-auto gap-3 text-center text-xs">
            <div className="p-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-card)]">
              <span className="text-[var(--text-muted)]">Mastered in Round</span>
              <p className="text-lg font-bold text-emerald-400 mt-1">+{sessionMasteredCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-card)]">
              <span className="text-[var(--text-muted)]">Cards in View</span>
              <p className="text-lg font-bold text-[var(--text-primary)] mt-1">{activeDeckCards.length}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <RotateCw className="w-4 h-4" />
              <span>Review Again</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedSubjectFilter("all-random");
                setShowUnmasteredOnly(false);
                handleReset();
              }}
              className="px-5 py-2.5 rounded-xl bg-[var(--input-bg)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition-all border border-[var(--border-card)]"
            >
              Shuffle All 5 Subjects
            </button>
          </div>
        </div>
      ) : activeDeckCards.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl border border-[var(--border-card)] text-center space-y-5">
          <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 w-fit mx-auto">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">No Mock Interview Questions Loaded Yet</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Upload your 5 subject shortlist files in the Upload Center, or paste your 10 questions directly. Each question will be structured into viva flashcards with keywords and examiner follow-up traps.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsSetupModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[var(--input-bg)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold flex items-center gap-2 transition-colors border border-[var(--border-card)]"
            >
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span>Configure My 5 Subjects</span>
            </button>

            <Link
              href="/upload"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-600/25"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Shortlist Files</span>
            </Link>
          </div>
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
              Use ← and → arrow keys to flip & navigate
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

      {/* Peer Quiz Battle Arena Modal */}
      <PeerQuizBattleModal
        isOpen={isBattleModalOpen}
        onClose={() => setIsBattleModalOpen(false)}
      />

      {/* Mock Interview 5 Subjects Setup Modal */}
      <MockInterviewSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />
    </div>
  );
}

export default function FlashcardsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Active Recall Deck...</div>}>
      <FlashcardsContent />
    </Suspense>
  );
}
