'use client';

import React, { useState } from 'react';
import { X, Award, FileText, Printer, CheckCircle, Sparkles, BookOpen, Layers } from 'lucide-react';
import { generateStructuredAnswer, generateUnitFormulaSheet } from '@/lib/exam-structurer';

interface ExamAnswerStructurerModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  subjectTitle: string;
  unitTitle: string;
}

export function ExamAnswerStructurerModal({
  isOpen,
  onClose,
  topicTitle,
  subjectTitle,
  unitTitle,
}: ExamAnswerStructurerModalProps) {
  const [activeTab, setActiveTab] = useState<'answer' | 'formula'>('answer');
  const [marks, setMarks] = useState<5 | 10>(10);

  if (!isOpen) return null;

  const answer = generateStructuredAnswer(topicTitle || 'AVL Tree Balancing & Rotations', marks);
  const formulaSheet = generateUnitFormulaSheet(subjectTitle || 'Advanced Data Structures', unitTitle || 'Unit I: Balanced Trees', 1);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="card w-full max-w-4xl max-h-[90vh] flex flex-col border border-[var(--border-card)] shadow-2xl overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-card)] flex items-center justify-between bg-theme-surface">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/15 text-indigo-400 rounded-xl border border-indigo-500/25">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-theme-primary flex items-center gap-2">
                University Exam Answer Structurer & Formula Sheet
              </h3>
              <p className="text-xs text-theme-muted">
                {subjectTitle} · {unitTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-theme-input hover:bg-theme-elevated text-theme-primary border border-[var(--border-card)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-theme-input transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="px-5 py-3 border-b border-[var(--border-card)] bg-theme-base/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('answer')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'answer'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-theme-input text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1.5" />
              5/10-Mark Answer Structurer
            </button>
            <button
              onClick={() => setActiveTab('formula')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'formula'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-theme-input text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 inline mr-1.5" />
              1-Page Unit Formula Sheet
            </button>
          </div>

          {activeTab === 'answer' && (
            <div className="flex items-center gap-1 bg-theme-input p-1 rounded-xl border border-[var(--border-card)]">
              <button
                onClick={() => setMarks(5)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  marks === 5 ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-theme-muted'
                }`}
              >
                5-Mark Answer
              </button>
              <button
                onClick={() => setMarks(10)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  marks === 10 ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-theme-muted'
                }`}
              >
                10-Mark Full Answer
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {activeTab === 'answer' ? (
            <div className="space-y-6 print:text-black">
              {/* Answer Header */}
              <div className="p-4 rounded-xl bg-theme-input/50 border border-[var(--border-card)] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-theme-primary">
                    Q: Explain {answer.title} in detail.
                  </h4>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    [{answer.marks} MARKS]
                  </span>
                </div>
                <p className="text-xs text-theme-muted italic">Format: Definition ➔ Core Architecture ➔ Step-by-Step ➔ Pros/Cons</p>
              </div>

              {/* 1. Definition */}
              <div className="space-y-1.5">
                <h5 className="font-bold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> 1. Standard Definition
                </h5>
                <p className="p-3.5 rounded-xl bg-theme-card border border-[var(--border-card)] text-theme-primary leading-relaxed">
                  {answer.definition}
                </p>
              </div>

              {/* 2. Core Concepts */}
              <div className="space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> 2. Key Structural Principles
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {answer.coreConcepts.map((concept, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-theme-input/40 border border-[var(--border-card)] space-y-1">
                      <h6 className="font-semibold text-xs text-theme-primary">{concept.title}</h6>
                      <p className="text-xs text-theme-secondary leading-relaxed">{concept.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Working Mechanism */}
              <div className="space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> 3. Step-by-Step Execution Sequence
                </h5>
                <div className="space-y-1.5">
                  {answer.workingMechanism.map((step, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-theme-card border border-[var(--border-card)] text-xs text-theme-secondary font-mono">
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Exam Tip */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <Award className="w-4 h-4 shrink-0 text-emerald-400" />
                <span><strong>Academic Evaluator Tip:</strong> {answer.examTip}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Formula Sheet Header */}
              <div className="text-center pb-4 border-b border-[var(--border-card)] space-y-1">
                <h4 className="text-xl font-extrabold text-theme-primary">{formulaSheet.subjectName}</h4>
                <p className="text-xs text-theme-muted">{formulaSheet.unitTitle} — Quick Revision Formula & Theorem Sheet</p>
              </div>

              {/* Definitions */}
              <div className="space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-indigo-400">Key Terms & Definitions</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {formulaSheet.keyDefinitions.map((def, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-theme-input/40 border border-[var(--border-card)] space-y-1">
                      <span className="font-bold text-xs text-theme-primary">{def.term}</span>
                      <p className="text-xs text-theme-secondary">{def.definition}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulas */}
              <div className="space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-amber-400">Core Mathematical Formulas</h5>
                <div className="space-y-2">
                  {formulaSheet.coreFormulas.map((form, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-theme-card border border-[var(--border-card)] flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-xs text-theme-primary">{form.name}</span>
                        <p className="text-[11px] text-theme-muted">{form.variables}</p>
                      </div>
                      <code className="px-3 py-1.5 rounded-lg bg-black/40 text-amber-300 font-mono text-xs border border-amber-500/20">
                        {form.formula}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
