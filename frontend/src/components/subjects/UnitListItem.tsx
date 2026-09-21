"use client";

import React from "react";
import Link from "next/link";
import { Unit } from "@/types";
import { cn } from "@/lib/utils";
import {
  Bot,
  Layers,
  UploadCloud,
  CheckCircle2,
  Clock,
  CircleDashed,
  FileText,
} from "lucide-react";

interface UnitListItemProps {
  unit: Unit;
  subjectId: string;
  subjectColor: string;
}

export function UnitListItem({
  unit,
  subjectId,
  subjectColor,
}: UnitListItemProps) {
  const getStatusBadge = (status: Unit["status"]) => {
    switch (status) {
      case "mastered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Mastered (100%)
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            In Progress ({unit.progressPercentage}%)
          </span>
        );
      case "not_started":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">
            <CircleDashed className="w-3 h-3" />
            Not Started
          </span>
        );
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] transition-all space-y-3 group">
      {/* Top Row: Unit Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="flex items-center justify-center w-6 h-6 rounded-lg text-xs font-mono font-bold shrink-0"
            style={{
              backgroundColor: `${subjectColor}20`,
              color: subjectColor,
              border: `1px solid ${subjectColor}40`,
            }}
          >
            U{unit.unitNumber}
          </span>
          <h4 className="text-sm font-bold text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
            {unit.title}
          </h4>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {getStatusBadge(unit.status)}
        </div>
      </div>

      {/* Topics Tags Pills */}
      {unit.topics && unit.topics.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {unit.topics.map((topic, index) => (
            <span
              key={index}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 border border-white/[0.05] transition-colors"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Row: Resource counts & Action Shortcuts */}
      <div className="pt-2 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Resource Meta */}
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            {unit.notesCount} notes
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            {unit.flashcardsCount} flashcards
          </span>
        </div>

        {/* Quick Launch Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href={`/chat?subject=${subjectId}&unit=${unit.unitNumber}`}
            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Tutor</span>
          </Link>

          <Link
            href={`/flashcards?subject=${subjectId}&unit=${unit.unitNumber}`}
            className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Flashcards</span>
          </Link>

          <Link
            href={`/upload?subject=${subjectId}&unit=${unit.unitNumber}`}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
