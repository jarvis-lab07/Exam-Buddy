"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { MOCK_SUBJECTS } from "@/lib/mock-data";

export default function SubjectsPage() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-3xl border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Semester 3 Subjects & Syllabus</h1>
            <p className="text-sm text-slate-400">
              Explore units, topic checklists, and AI-generated study guides
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_SUBJECTS.map((sub) => (
          <div
            key={sub.id}
            className="glass-card p-6 rounded-2xl border border-white/[0.08] space-y-4"
          >
            <div className="flex items-center justify-between">
              <span
                className="px-2 py-0.5 rounded text-xs font-mono font-bold"
                style={{
                  backgroundColor: `${sub.accentColor}20`,
                  color: sub.accentColor,
                  border: `1px solid ${sub.accentColor}40`,
                }}
              >
                {sub.code}
              </span>
              <span className="text-xs text-slate-400">{sub.category}</span>
            </div>

            <h2 className="text-lg font-bold text-white">{sub.name}</h2>
            <p className="text-xs text-slate-400">
              Next exam: {sub.nextExamDate} • {sub.completedUnits}/{sub.totalUnits} units completed
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
              <Link
                href={`/chat?subject=${sub.id}`}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask AI Tutor
              </Link>
              <Link
                href={`/subjects/${sub.id}`}
                className="text-xs text-indigo-300 hover:text-white font-semibold flex items-center gap-1"
              >
                View Syllabus <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
