"use client";

import React, { useState } from "react";
import { Subject, DegreeType } from "@/types";
import { X, Plus, Sparkles, BookOpen, Calendar, Palette, GraduationCap } from "lucide-react";

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubject: (newSubject: Subject) => void;
}

const colorPalette = [
  { name: "Indigo", hex: "#6366F1" },
  { name: "Cyan", hex: "#06B6D4" },
  { name: "Violet", hex: "#8B5CF6" },
  { name: "Emerald", hex: "#10B981" },
  { name: "Rose", hex: "#F43F5E" },
  { name: "Amber", hex: "#F59E0B" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Teal", hex: "#14B8A6" },
];

export function AddSubjectModal({
  isOpen,
  onClose,
  onAddSubject,
}: AddSubjectModalProps) {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [degree, setDegree] = useState<DegreeType>("Engineering");
  const [semesterOrYear, setSemesterOrYear] = useState("Semester 3");
  const [category, setCategory] = useState("Core Syllabus");
  const [examDate, setExamDate] = useState("Nov 30, 2026");
  const [color, setColor] = useState("#6366F1");
  const [unitCount, setUnitCount] = useState(4);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return;

    // Generate initial units
    const initialUnits = Array.from({ length: Math.max(1, unitCount) }).map(
      (_, index) => ({
        id: `${code.toLowerCase().replace(/\s+/g, "-")}-u${index + 1}`,
        unitNumber: index + 1,
        title: `Unit ${index + 1}: Fundamental Concepts & Core Analysis`,
        topics: [
          `Topic ${index + 1}.1: Key Principles`,
          `Topic ${index + 1}.2: Methodologies`,
          `Topic ${index + 1}.3: Exam Case Studies`,
        ],
        status: (index === 0 ? "in_progress" : "not_started") as "in_progress" | "not_started",
        progressPercentage: index === 0 ? 25 : 0,
        notesCount: 2,
        flashcardsCount: 15,
      })
    );

    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      name: title.trim(),
      title: title.trim(),
      code: code.trim().toUpperCase(),
      degree: degree === "All" ? "Engineering" : degree,
      semesterOrYear,
      category,
      color,
      accentColor: color,
      bgGradient: "from-indigo-500/20 via-indigo-500/5 to-transparent",
      examDate,
      nextExamDate: examDate,
      totalUnits: initialUnits.length,
      completedUnits: 0,
      totalTopics: initialUnits.length * 3,
      masteredTopics: 0,
      lastAccessed: "Just now",
      currentUnit: {
        unitNumber: 1,
        title: initialUnits[0].title,
        progressPercentage: 25,
      },
      units: initialUnits,
    };

    onAddSubject(newSub);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg glass-card rounded-3xl border border-white/[0.15] shadow-2xl p-6 sm:p-8 space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add New Subject & Syllabus</h2>
              <p className="text-xs text-slate-400">
                Setup course roadmap for AI study notes and active recall
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Title & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Subject Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Operating Systems"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Course Code <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CS304"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-500 uppercase font-mono focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          {/* Row 2: Degree & Term */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Degree Field</label>
              <select
                value={degree}
                onChange={(e) => setDegree(e.target.value as DegreeType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D111D] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-indigo-500/50"
              >
                <option value="Engineering">Engineering</option>
                <option value="Medicine">Medicine</option>
                <option value="Law">Law</option>
                <option value="Commerce">Commerce</option>
                <option value="Management">Management</option>
                <option value="Sciences">Sciences</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Semester / Term</label>
              <input
                type="text"
                value={semesterOrYear}
                onChange={(e) => setSemesterOrYear(e.target.value)}
                placeholder="e.g. Semester 3 or Year 2"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          {/* Row 3: Exam Date & Number of Units */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Target Exam Date</label>
              <input
                type="text"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                placeholder="e.g. Nov 30, 2026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Number of Units</label>
              <input
                type="number"
                min={1}
                max={12}
                value={unitCount}
                onChange={(e) => setUnitCount(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white font-mono focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          {/* Row 4: Color Theme Accent */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              <span>Color Theme</span>
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {colorPalette.map((cp) => (
                <button
                  key={cp.hex}
                  type="button"
                  onClick={() => setColor(cp.hex)}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    backgroundColor: cp.hex,
                    borderColor: color === cp.hex ? "#FFFFFF" : "transparent",
                    boxShadow: color === cp.hex ? `0 0 12px ${cp.hex}` : "none",
                  }}
                  title={cp.name}
                >
                  {color === cp.hex && <div className="w-2 h-2 rounded-full bg-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Create Subject</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
