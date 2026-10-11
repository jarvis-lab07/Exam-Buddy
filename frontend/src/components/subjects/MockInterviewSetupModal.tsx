"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
  Trash2,
  RotateCcw,
} from "lucide-react";
import {
  getUserSubjects,
  configureMy5Subjects,
  isCustomSyllabusOnly,
  setCustomSyllabusOnly,
  DEFAULT_VIVA_COLORS,
} from "@/lib/subject-service";
import { Subject } from "@/types";

interface MockInterviewSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubjectsConfigured?: (subjects: Subject[]) => void;
}

export function MockInterviewSetupModal({
  isOpen,
  onClose,
  onSubjectsConfigured,
}: MockInterviewSetupModalProps) {
  const [subjectsList, setSubjectsList] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
  ]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getUserSubjects();
      if (current.length > 0 && isCustomSyllabusOnly()) {
        const names = current.map((s) => s.name);
        while (names.length < 5) names.push("");
        setSubjectsList(names.slice(0, 5));
      }
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubjectChange = (index: number, value: string) => {
    setSubjectsList((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSave = () => {
    const valid = subjectsList.filter((s) => s.trim().length > 0);
    if (valid.length === 0) return;

    const newSubjects = configureMy5Subjects(valid);
    setIsSaved(true);
    if (onSubjectsConfigured) {
      onSubjectsConfigured(newSubjects);
    }

    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleResetToPresets = () => {
    setCustomSyllabusOnly(false);
    localStorage.removeItem("exam_buddy_user_subjects");
    window.dispatchEvent(new Event("exam_buddy_subjects_updated"));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="glass-card w-full max-w-xl p-6 sm:p-7 rounded-2xl border border-white/[0.12] bg-[#10121E] shadow-2xl space-y-6 border-t-2 border-cyan-500/50">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Configure Your 5 Syllabus Subjects
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                  Saturday Viva
                </span>
              </h2>
              <p className="text-xs text-[#9B99B5] mt-0.5">
                Enter your exact 5 subjects. All preset demo subjects will be removed so you only study what&apos;s on your syllabus.
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

        {/* 5 Subject Inputs */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">
            Your 5 Subjects for Mock Interview:
          </label>
          {subjectsList.map((subj, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
                style={{ backgroundColor: DEFAULT_VIVA_COLORS[idx % DEFAULT_VIVA_COLORS.length] }}
              >
                {idx + 1}
              </span>
              <input
                type="text"
                value={subj}
                onChange={(e) => handleSubjectChange(idx, e.target.value)}
                placeholder={`Subject ${idx + 1} (e.g. Distributed Systems, Machine Learning)`}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] focus:border-cyan-500 focus:outline-none text-white text-sm placeholder:text-slate-500 transition-colors"
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={handleResetToPresets}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            title="Reset to default demo subjects"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Demo Data</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.06] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaved || subjectsList.filter((s) => s.trim().length > 0).length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/25 transition-all"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Configured Successfully!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save My 5 Subjects</span>
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
