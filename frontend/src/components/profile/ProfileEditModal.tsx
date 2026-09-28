"use client";

import React, { useState } from "react";
import {
  User,
  GraduationCap,
  Building2,
  X,
  CheckCircle2,
  Sparkles,
  Award,
} from "lucide-react";
import { UserProfile } from "@/types";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updated: UserProfile) => void;
}

export function ProfileEditModal({ isOpen, onClose, user, onSave }: ProfileEditModalProps) {
  const [formData, setFormData] = useState<UserProfile>(user);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    try {
      localStorage.setItem("exam_buddy_user_profile", JSON.stringify(formData));
    } catch (e) {
      console.error(e);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg p-6 rounded-2xl border border-white/[0.12] bg-var(--bg-card) shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-theme-primary">Student Profile & Cohort</h3>
              <p className="text-xs text-theme-muted">
                Customize your academic specs for AI hints & cohort leaderboards.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-theme-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Identity Section */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <div className="text-[11px] font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Personal Identity
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-medium text-theme-secondary">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-var(--input-bg) border border-var(--input-border) text-xs text-var(--text-primary) focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-theme-secondary">Username / @handle</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-var(--input-bg) border border-var(--input-border) text-xs text-var(--text-primary) focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Academic Specs Section */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              Academic Specification
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-theme-secondary flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                College / University
              </label>
              <input
                type="text"
                required
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-var(--input-bg) border border-var(--input-border) text-xs text-var(--text-primary) focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="font-medium text-theme-secondary">Branch / Major</label>
                <input
                  type="text"
                  required
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-var(--input-bg) border border-var(--input-border) text-xs text-var(--text-primary) focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-theme-secondary">Year</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-var(--input-bg) border border-var(--input-border) text-xs text-var(--text-primary) focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-theme-secondary">Semester</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-var(--input-bg) border border-var(--input-border) text-xs text-var(--text-primary) focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                >
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                  <option value="Semester 5">Semester 5</option>
                  <option value="Semester 6">Semester 6</option>
                  <option value="Semester 7">Semester 7</option>
                  <option value="Semester 8">Semester 8</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cohort Section */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <label className="font-medium text-theme-secondary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Active Campus Cohort Pool
            </label>
            <input
              type="text"
              value={formData.activeCohort}
              onChange={(e) => setFormData({ ...formData, activeCohort: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-var(--input-bg) border border-var(--input-border) text-xs text-var(--text-primary) focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-theme-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-violet-500/25 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
