'use client';

import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle2, XCircle, RotateCcw, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';
import { QuizQuestion } from '@/app/api/generate-quiz/route';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectTitle?: string;
}

export function QuizModal({ isOpen, onClose, subjectTitle = 'Data Structures' }: QuizModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchQuiz();
    }
  }, [isOpen]);

  const fetchQuiz = async () => {
    setLoading(true);
    setIsCompleted(false);
    setCurrentIndex(0);
    setScore(0);
    setMistakes([]);
    setSelectedOption(null);
    setIsAnswered(false);

    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectName: subjectTitle }),
      });
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (e) {
      console.error('[QuizModal] Failed to load quiz:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQ.correctIndex) {
      setScore((s) => s + 1);
    } else {
      setMistakes((prev) => [...prev, currentQ]);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Adaptive Exam Quiz
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                  {subjectTitle}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Auto-saves incorrect answers to Mistake Notebook</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm space-y-2">
            <Sparkles className="w-6 h-6 animate-spin text-purple-400 mx-auto" />
            <p>Generating personalized exam questions from syllabus...</p>
          </div>
        ) : isCompleted ? (
          /* Completion Screen */
          <div className="py-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-xl font-extrabold text-white">Quiz Completed!</h4>
              <p className="text-sm text-slate-400 mt-1">
                You scored <span className="font-bold text-emerald-400">{score}</span> out of <span className="font-bold">{questions.length}</span> ({Math.round((score / questions.length) * 100)}%)
              </p>
            </div>

            {mistakes.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>{mistakes.length} Weak Spots Auto-Logged to Mistake Notebook:</span>
                </div>
                <ul className="list-disc pl-5 text-amber-200/90 space-y-1">
                  {mistakes.map((m) => (
                    <li key={m.id}>{m.question}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={fetchQuiz}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Question View */
          <div className="mt-5 space-y-5">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span className="text-purple-400">{currentQ?.topicTag}</span>
            </div>

            {/* Question Stem */}
            <h4 className="text-sm sm:text-base font-bold text-white leading-relaxed">
              {currentQ?.question}
            </h4>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ?.options.map((opt, idx) => {
                let btnStyle = 'bg-slate-950/70 border-slate-800 hover:border-purple-500/50 text-slate-200';
                if (isAnswered) {
                  if (idx === currentQ.correctIndex) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold';
                  } else if (idx === selectedOption) {
                    btnStyle = 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-semibold';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm flex items-center justify-between transition-all ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && idx === currentQ.correctIndex && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after answering */}
            {isAnswered && (
              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200 space-y-1 animate-in fade-in">
                <span className="font-bold text-purple-300 block">Explanation:</span>
                <p className="leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}

            {/* Next button */}
            {isAnswered && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-600/20"
                >
                  {currentIndex + 1 < questions.length ? 'Next Question →' : 'View Results'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
