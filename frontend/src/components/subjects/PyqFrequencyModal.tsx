'use client';

import React, { useState } from 'react';
import { X, Flame, AlertCircle, TrendingUp, BookOpen, CheckCircle, HelpCircle } from 'lucide-react';
import { getPyqAnalysisForSubject, getSampleMistakeNotebook, MistakeLogEntry } from '@/lib/pyq-analyzer';

interface PyqFrequencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectCode?: string;
  subjectTitle?: string;
}

export function PyqFrequencyModal({
  isOpen,
  onClose,
  subjectCode = 'CS301',
  subjectTitle = 'Advanced Algorithms',
}: PyqFrequencyModalProps) {
  const [activeTab, setActiveTab] = useState<'pyq' | 'mistakes'>('pyq');
  const [mistakes, setMistakes] = useState<MistakeLogEntry[]>(getSampleMistakeNotebook());

  if (!isOpen) return null;

  const pyqTopics = getPyqAnalysisForSubject(subjectCode);

  const toggleReviewed = (id: string) => {
    setMistakes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, reviewed: !m.reviewed } : m))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="card w-full max-w-4xl max-h-[90vh] flex flex-col border border-[var(--border-card)] shadow-2xl overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-card)] flex items-center justify-between bg-theme-surface">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/15 text-amber-400 rounded-xl border border-amber-500/25">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-theme-primary flex items-center gap-2">
                PYQ Frequency Analyzer & Mistake Notebook
              </h3>
              <p className="text-xs text-theme-muted">
                {subjectCode} · {subjectTitle}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-5 py-3 border-b border-[var(--border-card)] bg-theme-base/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('pyq')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'pyq'
                  ? 'bg-amber-500 text-black shadow'
                  : 'bg-theme-input text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <Flame className="w-3.5 h-3.5 inline mr-1.5 fill-amber-400" />
              5-Year PYQ Frequency Analyzer
            </button>
            <button
              onClick={() => setActiveTab('mistakes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'mistakes'
                  ? 'bg-rose-600 text-white shadow'
                  : 'bg-theme-input text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 inline mr-1.5" />
              Mistake Notebook ({mistakes.filter((m) => !m.reviewed).length} Unreviewed)
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'pyq' ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>High-Probability Topic Radar:</strong> Analyzed 5 years of university question papers (2021–2025). Topics tagged in red appear in over 90% of exam papers.
                </span>
              </div>

              <div className="space-y-3">
                {pyqTopics.map((topic) => (
                  <div key={topic.topicId} className="p-4 rounded-xl bg-theme-input/40 border border-[var(--border-card)] space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          {topic.probabilityRating}
                        </span>
                        <h4 className="text-sm font-bold text-theme-primary mt-1.5">{topic.topicName}</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-theme-secondary shrink-0">
                        {topic.totalAppearances} Total Appearances
                      </span>
                    </div>

                    {/* Year Frequency Bar */}
                    <div className="flex items-center gap-2 pt-1">
                      {topic.yearFrequencies.map((freq, idx) => (
                        <div key={idx} className="flex-1 p-2 rounded-lg bg-theme-card border border-[var(--border-card)] text-center text-xs">
                          <span className="text-theme-muted text-[10px] block">{freq.year}</span>
                          <span className="font-bold text-theme-primary">{freq.appearances} Qs</span>
                          <span className="text-[10px] text-indigo-400 block font-mono">[{freq.markValue}M]</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-theme-secondary italic bg-theme-card p-2.5 rounded-lg border border-[var(--border-card)]">
                      💡 <strong>Prep Strategy:</strong> {topic.recommendedPreparation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Mistake Notebook View */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Mistake Notebook:</strong> Auto-logs incorrect quiz answers to prevent repeating mistakes on final exam day.
                </span>
              </div>

              <div className="space-y-3">
                {mistakes.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-xl border transition-all ${
                      entry.reviewed
                        ? 'bg-theme-input/20 border-[var(--border-card)] opacity-60'
                        : 'bg-theme-card border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-indigo-400">{entry.subjectCode}</span>
                          <span className="text-theme-muted">·</span>
                          <span className="text-theme-secondary">{entry.topicName}</span>
                          <span className="text-theme-muted">· {entry.loggedAt}</span>
                        </div>
                        <h4 className="text-sm font-bold text-theme-primary mt-1">{entry.question}</h4>
                      </div>

                      <button
                        onClick={() => toggleReviewed(entry.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 ${
                          entry.reviewed
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-theme-input text-theme-secondary hover:text-theme-primary'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {entry.reviewed ? 'Reviewed' : 'Mark Reviewed'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-[var(--border-card)] text-xs">
                      <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                        <span className="font-bold block text-[10px] text-rose-400 uppercase">Your Wrong Choice:</span>
                        {entry.userWrongAnswer}
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                        <span className="font-bold block text-[10px] text-emerald-400 uppercase">Correct Answer:</span>
                        {entry.correctAnswer}
                      </div>
                    </div>

                    <p className="text-xs text-theme-secondary mt-2.5 bg-theme-input/50 p-2.5 rounded-lg border border-[var(--border-card)]">
                      📖 <strong>Trap Explanation:</strong> {entry.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
