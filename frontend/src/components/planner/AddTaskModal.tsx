"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  X,
  BookOpen,
  Clock,
  AlertCircle,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { MOCK_SUBJECTS } from "@/lib/mock-data";
import { StudyTask } from "@/types";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: (task: StudyTask) => void;
}

export function AddTaskModal({ isOpen, onClose, onTaskAdded }: AddTaskModalProps) {
  const [subjectId, setSubjectId] = useState<string>("dsa");
  const [title, setTitle] = useState("");
  const [taskType, setTaskType] = useState<StudyTask["type"]>("revision");
  const [dueText, setDueText] = useState("Today, 6:00 PM");
  const [isHighPriority, setIsHighPriority] = useState(false);

  if (!isOpen) return null;

  const selectedSubject = MOCK_SUBJECTS.find((s) => s.id === subjectId) || MOCK_SUBJECTS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: StudyTask = {
      id: `task-${Date.now()}`,
      subjectId: selectedSubject.id,
      subjectName: selectedSubject.name.split(" ")[0],
      subjectColor: selectedSubject.color,
      topicTitle: title.trim(),
      type: taskType,
      dueText: dueText.trim() || "Today",
      isHighPriority,
      completed: false,
    };

    onTaskAdded(newTask);
    onClose();
    setTitle("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="glass-card w-full max-w-lg p-6 rounded-3xl border border-white/[0.1] bg-[#121320] shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Schedule Study Session</h3>
              <p className="text-xs text-slate-400">
                Add an exam prep task calibrated to your midterm dates.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Topic or Task Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Red-Black Tree Rotations & Black-Height proof"
              className="w-full h-10 px-3 rounded-xl bg-[#141624] border border-white/[0.08] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Subject & Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#141624] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-amber-500/50"
              >
                {MOCK_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code}: {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                Session Type
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as StudyTask["type"])}
                className="w-full h-10 px-3 rounded-xl bg-[#141624] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="revision">Spaced Revision</option>
                <option value="quiz">Speed Quiz</option>
                <option value="flashcards">Flashcards</option>
                <option value="practice">PYQ Practice</option>
              </select>
            </div>
          </div>

          {/* Due Text */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Due Time / Schedule
            </label>
            <input
              type="text"
              value={dueText}
              onChange={(e) => setDueText(e.target.value)}
              placeholder="e.g. Today, 7:30 PM or Tomorrow 10:00 AM"
              className="w-full h-10 px-3 rounded-xl bg-[#141624] border border-white/[0.08] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* High Priority Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isHighPriority}
              onChange={(e) => setIsHighPriority(e.target.checked)}
              className="rounded bg-[#141624] border-white/[0.1] text-amber-500 focus:ring-amber-500"
            />
            <span className="text-slate-300 font-medium">Mark as High Priority (Midterm Exam Topic)</span>
          </label>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-semibold text-black flex items-center gap-1.5 shadow-md shadow-amber-500/30"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Add to Schedule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
