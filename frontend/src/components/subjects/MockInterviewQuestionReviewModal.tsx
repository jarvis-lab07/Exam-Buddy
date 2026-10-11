"use client";

import React, { useState } from "react";
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  X,
  AlertCircle,
  FileText,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Subject, Flashcard } from "@/types";
import {
  parseQuestionsAndAnswersFromRawText,
  generateVivaCardsForQuestions,
  saveMockInterviewFlashcards,
  ExtractedQuestionItem,
} from "@/lib/mock-interview-service";

interface MockInterviewQuestionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
  initialText: string;
  isScannedPdf?: boolean;
  onSuccess: (cards: Flashcard[]) => void;
}

export function MockInterviewQuestionReviewModal({
  isOpen,
  onClose,
  subject,
  initialText,
  isScannedPdf = false,
  onSuccess,
}: MockInterviewQuestionReviewModalProps) {
  const [questionsText, setQuestionsText] = useState(initialText || "");
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync if initialText changes when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setQuestionsText(initialText || "");
      setIsGenerating(false);
    }
  }, [isOpen, initialText]);

  if (!isOpen) return null;

  const parsedItems = parseQuestionsAndAnswersFromRawText(questionsText);
  const hasTeacherAnswers = parsedItems.some((i) => i.answer && i.answer.length > 10);

  const handleConfirm = async () => {
    if (parsedItems.length === 0 || isGenerating) return;

    setIsGenerating(true);

    try {
      const cards = await generateVivaCardsForQuestions(subject, parsedItems);
      saveMockInterviewFlashcards(cards, true);
      onSuccess(cards);
      onClose();
    } catch (e) {
      console.error("Failed to generate cards:", e);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-card w-full max-w-2xl p-6 sm:p-7 rounded-2xl border border-white/[0.12] bg-[#10121E] shadow-2xl space-y-5 border-t-2 border-cyan-500/60 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Review Viva Questions
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: `${subject.color}25`, color: subject.color }}
                >
                  {subject.code || "SUB"}: {subject.name}
                </span>
              </h2>
              <p className="text-xs text-[#9B99B5] mt-0.5">
                Verify or edit the questions before generating your active recall viva cards.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanned PDF warning if applicable */}
        {isScannedPdf && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <p>
              This document appears to be a scanned image without selectable text. Please paste or type your 10 questions below (one per line, e.g. 1. What is...):
            </p>
          </div>
        )}

        {/* Text Area */}
        <div className="space-y-1.5 flex-1 min-h-[160px] flex flex-col">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span>Questions &amp; Answers:</span>
              {hasTeacherAnswers && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Teacher Model Answers Detected
                </span>
              )}
            </div>
            <span className="font-mono text-cyan-400 font-bold">
              Detected ~{parsedItems.length} Question{parsedItems.length === 1 ? "" : "s"}
            </span>
          </div>

          <textarea
            value={questionsText}
            onChange={(e) => setQuestionsText(e.target.value)}
            placeholder={`1. What is the CIA triad and why is confidentiality critical in cyber security?\n2. Explain the mechanism of RSA public key encryption...\n3. Differentiate between Symmetric and Asymmetric ciphers...`}
            rows={10}
            className="w-full flex-1 p-3.5 rounded-xl bg-black/60 border border-white/[0.1] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 font-mono resize-y leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/[0.06] shrink-0">
          <span className="text-[11px] text-slate-500">
            Splits into individual cards with teacher answers and keywords on the back.
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.06] transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={parsedItems.length === 0 || isGenerating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/25 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Viva Cards...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate {parsedItems.length} Individual Cards</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
