"use client";

import React, { use } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Sparkles, CheckCircle2 } from "lucide-react";
import { MOCK_SUBJECTS } from "@/lib/mock-data";

export default function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const subject = MOCK_SUBJECTS.find((s) => s.id === resolvedParams.id) || MOCK_SUBJECTS[0];

  return (
    <div className="space-y-6">
      <Link
        href="/subjects"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to All Subjects
      </Link>

      <div className="glass-card p-6 rounded-3xl border border-white/[0.08] space-y-3">
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded text-xs font-mono font-bold"
            style={{
              backgroundColor: `${subject.accentColor}20`,
              color: subject.accentColor,
              border: `1px solid ${subject.accentColor}40`,
            }}
          >
            {subject.code}
          </span>
          <span className="text-xs text-slate-400">{subject.category}</span>
        </div>

        <h1 className="text-2xl font-bold text-white">{subject.name}</h1>
        <p className="text-sm text-slate-300">
          Targeting Midterm Examination on {subject.nextExamDate}. Current unit: Unit {subject.currentUnit.unitNumber} ({subject.currentUnit.title})
        </p>

        <div className="pt-3 flex gap-3">
          <Link
            href={`/chat?subject=${subject.id}`}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Launch AI Study Assistant
          </Link>
        </div>
      </div>
    </div>
  );
}
