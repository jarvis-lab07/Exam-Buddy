"use client";

import React, { useState } from "react";
import {
  User,
  GraduationCap,
  Building2,
  X,
  CheckCircle2,
  Sparkles,
  Mail,
  Layers,
  FileText,
  Calendar,
  LogOut,
  Clock,
  Flame,
  BookOpen,
  Cloud,
  ExternalLink,
} from "lucide-react";
import { UserProfile } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { isDriveConnectedInStorage } from "@/lib/google-drive-service";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updated: UserProfile) => void;
}

export function ProfileEditModal({ isOpen, onClose, user, onSave }: ProfileEditModalProps) {
  const [formData, setFormData] = useState<UserProfile>(user);
  const { signOut, user: authUser } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    try {
      localStorage.setItem("exam_buddy_user_profile", JSON.stringify(formData));
      localStorage.setItem("exambuddy_cohort_user", JSON.stringify(formData));
    } catch (e) {
      console.error(e);
    }
    onClose();
  };

  const handleSignOut = async () => {
    onClose();
    await signOut();
  };

  const avatarSrc = formData.avatarUrl || formData.avatar || authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-surface)] shadow-2xl space-y-5 scrollbar-thin scrollbar-thumb-white/10 text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-violet-500/25 ring-2 ring-violet-500/40 overflow-hidden">
              {avatarSrc ? (
                <img src={avatarSrc} alt={formData.name || 'Student'} className="w-full h-full object-cover" />
              ) : (
                <span>{formData.name?.charAt(0).toUpperCase() || "S"}</span>
              )}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                {formData.name || "Student Profile"}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30">
                  Verified Student
                </span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 font-mono">
                {formData.email || "student@college.edu"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-card)] text-xs">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Study Streak</div>
              <div className="font-bold text-amber-500 dark:text-amber-300">7 Days Active</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-400" />
            <div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Daily Target</div>
              <div className="font-bold text-violet-500 dark:text-violet-300">{formData.dailyGoal || 60} Mins / Day</div>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Cohort Pool</div>
              <div className="font-bold text-cyan-500 dark:text-cyan-300 truncate max-w-[110px]">
                {formData.division || "Div A"} • {formData.year || "3rd Year"}
              </div>
            </div>
          </div>
        </div>

        {/* Editable Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Identity Section */}
          <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-card)] space-y-3">
            <div className="text-[11px] font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Personal & Student Identity
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Academic Specifications */}
          <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-card)] space-y-3">
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              Academic Specification
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                College / Institute Name *
              </label>
              <input
                type="text"
                required
                value={formData.college || ""}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full h-9 px-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Department / Major *</label>
                <input
                  type="text"
                  required
                  value={formData.branch || formData.department || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branch: e.target.value,
                      department: e.target.value,
                    })
                  }
                  className="w-full h-9 px-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Division (Div) *</label>
                <input
                  type="text"
                  required
                  value={formData.division || "Div A"}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Current Year *</label>
                <select
                  value={formData.year || "2nd Year"}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-violet-500"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">Semester *</label>
                <select
                  value={formData.semester || "Semester 3 (2nd Year)"}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-violet-500"
                >
                  <option value="Semester 1 (1st Year)">Semester 1</option>
                  <option value="Semester 2 (1st Year)">Semester 2</option>
                  <option value="Semester 3 (2nd Year)">Semester 3</option>
                  <option value="Semester 4 (2nd Year)">Semester 4</option>
                  <option value="Semester 5 (3rd Year)">Semester 5</option>
                  <option value="Semester 6 (3rd Year)">Semester 6</option>
                  <option value="Semester 7 (4th Year)">Semester 7</option>
                  <option value="Semester 8 (4th Year)">Semester 8</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-secondary)]">College PRN / Roll No</label>
                <input
                  type="text"
                  placeholder="e.g. 2022032500012345"
                  value={formData.prnNumber || ""}
                  onChange={(e) => setFormData({ ...formData, prnNumber: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>

          {/* Daily Goal & Preferences */}
          <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-card)] space-y-3">
            <div className="text-[11px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Daily Study Goal Target
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min={15}
                max={300}
                step={15}
                value={formData.dailyGoal || 60}
                onChange={(e) =>
                  setFormData({ ...formData, dailyGoal: parseInt(e.target.value, 10) || 60 })
                }
                className="w-28 h-9 px-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--text-primary)] font-bold text-center focus:outline-none focus:border-violet-500"
              />
              <span className="text-xs text-[var(--text-secondary)]">Minutes per day exam practice</span>
            </div>
          </div>

          {/* Connected Accounts & Cloud Integrations */}
          <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-card)] space-y-3">
            <div className="text-[11px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5" />
              Connected Accounts & Storage
            </div>

            <div className="space-y-2 text-xs">
              {/* Google Account Identity */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-card)]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-bold text-blue-600 text-[10px] shrink-0 border border-slate-300">
                    G
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--text-primary)]">Google Authentication</div>
                    <div className="text-[10px] text-[var(--text-muted)] truncate max-w-[200px]">
                      {authUser?.email || formData.email || "student@gmail.com"}
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              </div>

              {/* Google Drive BYOS */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-card)]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-500 text-[10px] shrink-0">
                    <Cloud className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--text-primary)]">Google Drive (BYOS)</div>
                    <div className="text-[10px] text-[var(--text-muted)]">
                      {isDriveConnectedInStorage() ? "Connected (drive.file scope)" : "Optional cloud material import"}
                    </div>
                  </div>
                </div>
                <a
                  href="/upload"
                  onClick={onClose}
                  className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] font-bold border border-blue-500/25 transition-colors flex items-center gap-1"
                >
                  <span>{isDriveConnectedInStorage() ? "Manage" : "Connect"}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Account</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-violet-500/25 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Student Specs</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
