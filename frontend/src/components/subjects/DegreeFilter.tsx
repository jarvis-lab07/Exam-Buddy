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
                "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0",
                isSelected
                  ? "bg-[#10a37f] text-white shadow-sm border border-[#10a37f]"
                  : "bg-[var(--input-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-[var(--border-card)]"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-white" : "text-[var(--text-muted)]")} />
              <span>{deg.label}</span>
              {count !== undefined && count > 0 && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold",
                    isSelected
                      ? "bg-black/20 text-white"
                      : "bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
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
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border-card)] text-xs text-[var(--text-primary)]">
          <Filter className="w-3.5 h-3.5 text-[#10a37f] shrink-0" />
          <span className="text-[var(--text-muted)] font-semibold">Term:</span>
          <select
            value={selectedTerm}
            onChange={(e) => onSelectTerm(e.target.value)}
            className="bg-transparent text-[var(--text-primary)] font-bold text-xs focus:outline-none cursor-pointer pr-1"
          >
            {terms.map((t) => (
              <option key={t} value={t} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
