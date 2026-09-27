"use client";

import React, { useState, useMemo } from "react";
import { DegreeType, Subject } from "@/types";
import { MOCK_SUBJECTS } from "@/lib/mock-data";
import { DegreeFilter } from "@/components/subjects/DegreeFilter";
import { SubjectCard } from "@/components/subjects/SubjectCard";
import { AddSubjectModal } from "@/components/subjects/AddSubjectModal";
import { CampusCohortCard } from "@/components/subjects/CampusCohortCard";
import {
  BookOpen,

  Search,
  Plus,
  Sparkles,
  Layers,
  GraduationCap,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>(MOCK_SUBJECTS);
  const [selectedDegree, setSelectedDegree] = useState<DegreeType>("All");
  const [selectedTerm, setSelectedTerm] = useState<string>("All Terms");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Compute degree counts
  const degreeCounts = useMemo(() => {
    const counts: Record<string, number> = { All: subjects.length };
    subjects.forEach((s) => {
      counts[s.degree] = (counts[s.degree] || 0) + 1;
    });
    return counts;
  }, [subjects]);

  // Filter subjects based on search, degree, and term
  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      // Degree filter
      if (selectedDegree !== "All" && subject.degree !== selectedDegree) {
        return false;
      }

      // Term filter
      if (
        selectedTerm !== "All Terms" &&
        !subject.semesterOrYear.toLowerCase().includes(selectedTerm.toLowerCase())
      ) {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = (subject.title || subject.name).toLowerCase().includes(query);
        const matchesCode = subject.code.toLowerCase().includes(query);
        const matchesCategory = subject.category?.toLowerCase().includes(query);
        const matchesTopics = subject.units?.some((unit) =>
          unit.title.toLowerCase().includes(query) ||
          unit.topics?.some((t) => t.toLowerCase().includes(query))
        );

        return matchesTitle || matchesCode || matchesCategory || matchesTopics;
      }

      return true;
    });
  }, [subjects, selectedDegree, selectedTerm, searchQuery]);

  const handleAddSubject = (newSubject: Subject) => {
    setSubjects((prev) => [newSubject, ...prev]);
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDuplicateSubject = (src: Subject) => {
    const timestamp = Date.now();
    const copy: Subject = {
      ...src,
      id: `sub-${timestamp}`,
      name: `${src.name || src.title || "Subject"} (Copy)`,
      title: `${src.title || src.name || "Subject"} (Copy)`,
      code: `${src.code}-COPY`,
      lastAccessed: "Just now",
      units: (src.units || []).map((u, i) => ({
        ...u,
        id: `copy-${timestamp}-u${i + 1}`,
        status: "not_started" as const,
        progressPercentage: 0,
      })),
    };
    setSubjects((prev) => [copy, ...prev]);
  };

  const handleMarkExamDone = (id: string) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              completedUnits: s.units?.length || s.totalUnits || 0,
              masteredTopics: s.totalTopics || 0,
              units: (s.units || []).map((u) => ({
                ...u,
                status: "mastered" as const,
                progressPercentage: 100,
              })),
              category: `${s.category || ""}`.trim() || "Completed Course",
            }
          : s
      )
    );
  };

  const handleRemoveUnit = (subjectId: string, unitId: string) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        const nextUnits = (s.units || []).filter((u) => u.id !== unitId);
        return {
          ...s,
          units: nextUnits,
          totalUnits: nextUnits.length,
          totalTopics: nextUnits.length * 3,
        };
      })
    );
  };

  const handleToggleUnitStatus = (subjectId: string, unitId: string) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          units: (s.units || []).map((u) => {
            if (u.id !== unitId) return u;
            if (u.status === "mastered") {
              return { ...u, status: "not_started" as const, progressPercentage: 0 };
            }
            return { ...u, status: "mastered" as const, progressPercentage: 100 };
          }),
        };
      })
    );
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Page Header & Stats Banner */}
      <section className="relative overflow-hidden rounded-2xl glass-card p-6 sm:p-8 border border-white/[0.1] border-t-2 border-indigo-500/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Universal Academic Syllabus Tree</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Syllabus & Course Explorer
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Browse syllabus trees, topic checklists, lecture notes, and AI-powered active recall units across all degree disciplines.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Total Active Courses: <strong className="text-slate-200">{subjects.length} Subjects</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-violet-400" />
                Curriculum Units:{" "}
                <strong className="text-emerald-400">
                  {subjects.reduce((acc, s) => acc + (s.units?.length || s.totalUnits || 0), 0)} Units Loaded
                </strong>
              </span>
            </div>
          </div>

          {/* "+ Add New Subject" Action Trigger */}
          <div className="shrink-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm transition-colors duration-200"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New Subject</span>
            </button>
          </div>
        </div>
      </section>

      {/* Campus Cohort Knowledge Pool & Department Leaderboard */}
      <CampusCohortCard />

      {/* 2. Search & Toolbar Controls */}
      <section className="space-y-4">

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject, code, or topic (e.g., AVL Trees, TCP, Ind-AS)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.08] focus:border-indigo-500/50 text-sm text-white placeholder-slate-400 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-white">{filteredSubjects.length}</strong> of {subjects.length} subjects
          </div>
        </div>

        {/* Degree & Term Switcher Filter Bar */}
        <div className="p-3.5 rounded-2xl glass-card border border-white/[0.07]">
          <DegreeFilter
            selectedDegree={selectedDegree}
            onSelectDegree={setSelectedDegree}
            selectedTerm={selectedTerm}
            onSelectTerm={setSelectedTerm}
            degreeCounts={degreeCounts}
          />
        </div>
      </section>

      {/* 3. Subjects Grid */}
      {filteredSubjects.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSubjects.map((subject, index) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              defaultExpanded={index === 0 && filteredSubjects.length === 1}
              onDeleteSubject={handleDeleteSubject}
              onDuplicateSubject={handleDuplicateSubject}
              onMarkExamDone={handleMarkExamDone}
              onRemoveUnit={handleRemoveUnit}
              onToggleUnitStatus={handleToggleUnitStatus}
            />
          ))}
        </section>
      ) : (
        /* Empty State */
        <section className="glass-card p-12 rounded-2xl border border-white/[0.08] text-center space-y-4 max-w-md mx-auto">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] mx-auto text-slate-400">
            <Search className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No matching subjects found</h3>
            <p className="text-xs text-slate-400">
              No courses matched &ldquo;{searchQuery || selectedDegree}&rdquo;. Try clearing filters or add a new course syllabus.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSelectedDegree("All");
                setSelectedTerm("All Terms");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-xs font-semibold text-slate-300 transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors"
            >
              + Add Subject
            </button>
          </div>
        </section>
      )}

      {/* Add Subject Modal */}
      <AddSubjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSubject={handleAddSubject}
      />
    </div>
  );
}
