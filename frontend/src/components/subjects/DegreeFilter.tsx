"use client";

import React from "react";
import { DegreeType } from "@/types";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  Cpu,
  Stethoscope,
  Scale,
  TrendingUp,
  Briefcase,
  Atom,
  Filter,
} from "lucide-react";

interface DegreeFilterProps {
  selectedDegree: DegreeType;
  onSelectDegree: (degree: DegreeType) => void;
  selectedTerm: string;
  onSelectTerm: (term: string) => void;
  degreeCounts?: Record<string, number>;
}

const degrees: { id: DegreeType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "All", label: "All Degrees", icon: GraduationCap },
  { id: "Engineering", label: "Engineering", icon: Cpu },
  { id: "Medicine", label: "Medicine", icon: Stethoscope },
  { id: "Law", label: "Law", icon: Scale },
  { id: "Commerce", label: "Commerce", icon: TrendingUp },
  { id: "Management", label: "Management", icon: Briefcase },
  { id: "Sciences", label: "Sciences", icon: Atom },
];

const terms = [
  "All Terms",
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
];

export function DegreeFilter({
  selectedDegree,
  onSelectDegree,
  selectedTerm,
  onSelectTerm,
  degreeCounts = {},
}: DegreeFilterProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* Horizontal Scrollable Degree Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none no-scrollbar">
        {degrees.map((deg) => {
          const Icon = deg.icon;
          const isSelected = selectedDegree === deg.id;
          const count = degreeCounts[deg.id];

          return (
            <button
              key={deg.id}
              onClick={() => onSelectDegree(deg.id)}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0",
                isSelected
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 border border-indigo-500/40"
                  : "bg-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.07] border border-white/[0.06]"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-white" : "text-slate-400")} />
              <span>{deg.label}</span>
              {count !== undefined && count > 0 && (
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-white/[0.06] text-slate-400"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Term / Semester Selector Dropdown */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300">
          <Filter className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-slate-400 font-medium">Term:</span>
          <select
            value={selectedTerm}
            onChange={(e) => onSelectTerm(e.target.value)}
            className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer pr-1"
          >
            {terms.map((t) => (
              <option key={t} value={t} className="bg-[#0D111D] text-white">
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
