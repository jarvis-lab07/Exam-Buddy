"use client";

import React, { useState } from "react";
import {
  User,
  GraduationCap,
  Building2,
  Calendar,
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-white/[0.1] bg-[#121320] shadow-2xl space-y-5 border-t-2 border-indigo-500/40">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Student Profile & Cohort</h3>
              <p className="text-xs text-slate-400">
                Customize your academic details for tailored AI hints and cohort leaderboards.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-[#141624] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Username / @handle</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-[#141624] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              College / University
            </label>
            <input
              type="text"
              required
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-[#141624] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-violet-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
                Branch / Major
              </label>
              <input
                type="text"
                required
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-[#141624] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Year</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-[#141624] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-violet-500/50"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-[#141624] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-violet-500/50"
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

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Active Campus Cohort
            </label>
            <input
              type="text"
              value={formData.activeCohort}
              onChange={(e) => setFormData({ ...formData, activeCohort: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-[#141624] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-violet-500/50"
            />
          </div>

          {/* Footer */}
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
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
