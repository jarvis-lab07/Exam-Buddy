'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, AlertTriangle, CheckCircle, Trophy, Zap, Target, ArrowRight, RefreshCw, BarChart2 } from 'lucide-react';
import { calculateExamScore, ExamSimulationSettings, ExamResultSummary } from '@/lib/exam-simulator';

interface CompetitiveExamSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  examTitle?: string;
}

const DEFAULT_QUESTIONS = [
  {
    question: 'Which tree rotation is required when a node is inserted into the right sub-tree of the left child of an unbalanced AVL node?',
    options: ['Left-Right (LR) Rotation', 'Right-Left (RL) Rotation', 'Single Left Rotation', 'Single Right Rotation'],
    correctOption: 0,
    explanation: 'A Left-Right (LR) double rotation is required when imbalance is caused by insertion into the right sub-tree of the left child.',
  },
  {
    question: 'What is the time complexity of searching for an element in a B-Tree of order m and height h?',
    options: ['O(h · log₂ m)', 'O(m · h)', 'O(h)', 'O(m² · h)'],
    correctOption: 0,
    explanation: 'Binary search inside each node takes O(log m), and traversing height h takes h steps, resulting in O(h · log m).',
  },
  {
    question: 'Which property of the SHA-256 hash function ensures that even a 1-bit change in input causes a complete change in output?',
    options: ['Avalanche Effect', 'Pigeonhole Principle', 'Collision Resistance', 'Pre-image Resistance'],
    correctOption: 0,
    explanation: 'The Avalanche Effect guarantees that small changes in input radically change output hash bits.',
  },
];

export function CompetitiveExamSimulatorModal({
  isOpen,
  onClose,
  examTitle = 'GATE / University Computer Science Mock Exam',
}: CompetitiveExamSimulatorModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([-1, -1, -1]);
  const [secondsSpentPerQuestion, setSecondsSpentPerQuestion] = useState<number[]>([0, 0, 0]);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes for demo
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<ExamResultSummary | null>(null);

  const settings: ExamSimulationSettings = {
    totalQuestions: DEFAULT_QUESTIONS.length,
    durationMinutes: 3,
    positiveMarksPerQuestion: 4,
    negativeMarkingPenalty: 1, // +4 / -1 negative marking
    allowReviewLater: true,
  };

  useEffect(() => {
    if (!isOpen || isFinished) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });

      setSecondsSpentPerQuestion((prev) => {
        const next = [...prev];
        next[currentQuestion] = (next[currentQuestion] || 0) + 1;
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isFinished, currentQuestion]);

  if (!isOpen) return null;

  const handleOptionSelect = (optionIdx: number) => {
    const next = [...selectedAnswers];
    next[currentQuestion] = optionIdx;
    setSelectedAnswers(next);
  };

  const handleFinishExam = () => {
    const answerData = selectedAnswers.map((opt, idx) => ({
      selectedOption: opt,
      correctOption: DEFAULT_QUESTIONS[idx].correctOption,
      secondsSpent: secondsSpentPerQuestion[idx] || 10,
    }));
    const examScore = calculateExamScore(answerData, settings);
    setResult(examScore);
    setIsFinished(true);
  };

  const resetExam = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([-1, -1, -1]);
    setSecondsSpentPerQuestion([0, 0, 0]);
    setTimeRemaining(180);
    setIsFinished(false);
    setResult(null);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="card w-full max-w-3xl border border-[var(--border-card)] shadow-2xl overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-card)] flex items-center justify-between bg-theme-surface">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/15 text-rose-400 rounded-xl border border-rose-500/25">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-theme-primary flex items-center gap-2">
                Competitive Exam Simulation Mode
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                  +4 / -1 Penalty
                </span>
              </h3>
              <p className="text-xs text-theme-muted">{examTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isFinished && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-input border border-[var(--border-card)] font-mono text-sm font-bold text-amber-400">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{formatTimer(timeRemaining)}</span>
              </div>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isFinished ? (
          <div className="p-6 space-y-6">
            {/* Question Progress Header */}
            <div className="flex items-center justify-between text-xs text-theme-secondary">
              <span className="font-semibold text-theme-primary">
                Question {currentQuestion + 1} of {DEFAULT_QUESTIONS.length}
              </span>
              <span className="font-mono text-theme-muted">
                Time spent on Q{currentQuestion + 1}: {secondsSpentPerQuestion[currentQuestion] || 0}s
              </span>
            </div>

            {/* Question Card */}
            <div className="p-4 rounded-xl bg-theme-input/40 border border-[var(--border-card)] space-y-3">
              <h4 className="text-sm font-bold text-theme-primary leading-relaxed">
                {DEFAULT_QUESTIONS[currentQuestion].question}
              </h4>

              {/* Options */}
              <div className="space-y-2 pt-2">
                {DEFAULT_QUESTIONS[currentQuestion].options.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentQuestion] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(idx)}
                      className={`w-full p-3.5 rounded-xl text-left text-xs font-medium border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                          : 'bg-theme-card border-[var(--border-card)] text-theme-secondary hover:text-theme-primary hover:border-theme-hover'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion((prev) => prev - 1)}
                className="px-4 py-2 rounded-xl bg-theme-input disabled:opacity-40 text-xs font-semibold text-theme-secondary"
              >
                Previous
              </button>

              {currentQuestion < DEFAULT_QUESTIONS.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestion((prev) => prev + 1)}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  Next Question <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleFinishExam}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  Submit & Score Exam
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Score Result View */
          <div className="p-6 space-y-6">
            <div className="text-center p-6 rounded-2xl bg-theme-input/40 border border-[var(--border-card)] space-y-2">
              <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <h4 className="text-2xl font-extrabold text-theme-primary">
                Final Score: {result?.finalScore} / {result?.maxScore}
              </h4>
              <p className="text-xs text-theme-secondary">
                Accuracy Score: <strong className="text-emerald-400">{result?.percentage}%</strong> · Speed Rating: <strong className="text-indigo-400">{result?.speedRating}</strong>
              </p>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-lg font-bold text-emerald-400">{result?.correctCount}</span>
                <p className="text-[11px] text-theme-muted">Correct (+4 each)</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-lg font-bold text-rose-400">{result?.incorrectCount}</span>
                <p className="text-[11px] text-theme-muted">Incorrect (-1 penalty)</p>
              </div>
              <div className="p-3 rounded-xl bg-theme-input border border-[var(--border-card)]">
                <span className="text-lg font-bold text-theme-secondary">{result?.unattemptedCount}</span>
                <p className="text-[11px] text-theme-muted">Unattempted</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <span className="text-lg font-bold text-indigo-300">{result?.avgSecondsPerQuestion}s</span>
                <p className="text-[11px] text-theme-muted">Avg time/question</p>
              </div>
            </div>

            {/* Restart Button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={resetExam}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Try Simulation Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
