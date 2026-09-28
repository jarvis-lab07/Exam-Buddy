'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Flame, Target, Users, Sparkles, BookOpen, Download } from 'lucide-react';
import {
  fetchDepartmentLeaderboard,
  fetchCohortKnowledgePool,
  CohortStudentLeaderboard,
  SharedCohortResource,
} from '@/lib/cohort-service';
import { useAuth } from '@/contexts/AuthContext';

export function CohortLeaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<CohortStudentLeaderboard[]>([]);
  const [resources, setResources] = useState<SharedCohortResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCohortData() {
      setLoading(true);
      const [lbData, poolData] = await Promise.all([
        fetchDepartmentLeaderboard('VJTI Mumbai', 'Computer Engineering'),
        fetchCohortKnowledgePool(),
      ]);
      setLeaderboard(lbData);
      setResources(poolData);
      setLoading(false);
    }
    loadCohortData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card p-6 border-t-2 border-emerald-500/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Campus Cohort: VJTI Mumbai · Computer Engg (2nd Year)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-theme-primary">
              Classroom Study Streak & Knowledge Pool 🏆
            </h2>
            <p className="text-theme-secondary text-sm">
              Compete with classmates, stay on track with daily focus streak rankings, and access verified lecture notes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Leaderboard Column */}
        <div className="lg:col-span-2 card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
            <h3 className="text-base font-bold text-theme-primary flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Department Focus Leaderboard
            </h3>
            <span className="text-xs text-theme-muted">Updated live</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-theme-muted text-sm">Loading leaderboard data...</div>
          ) : (
            <div className="space-y-2.5">
              {leaderboard.map((student) => {
                const isTop1 = student.rank === 1;
                const isTop2 = student.rank === 2;
                const isTop3 = student.rank === 3;

                return (
                  <div
                    key={student.handle}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isTop1
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : isTop2
                        ? 'bg-slate-400/10 border-slate-400/20'
                        : isTop3
                        ? 'bg-amber-700/10 border-amber-700/20'
                        : 'bg-theme-input/50 border-[var(--border-card)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          isTop1
                            ? 'bg-amber-500 text-black'
                            : isTop2
                            ? 'bg-slate-300 text-black'
                            : isTop3
                            ? 'bg-amber-700 text-white'
                            : 'bg-theme-input text-theme-secondary'
                        }`}
                      >
                        {student.rank}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-theme-primary">{student.name}</span>
                          <span className="text-xs text-theme-muted">{student.handle}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-theme-secondary mt-0.5">
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-400" />
                            {student.streakDays}d streak
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3 text-emerald-400" />
                            {student.quizAccuracy}% accuracy
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-theme-primary">{student.weeklyFocusMinutes} mins</span>
                      <p className="text-[10px] text-theme-muted">weekly focus</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Crowdsourced Notes Pool Column */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
            <h3 className="text-base font-bold text-theme-primary flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Verified Class Notes Pool
            </h3>
            <span className="text-xs text-emerald-400 font-medium">{resources.length} uploaded</span>
          </div>

          <div className="space-y-3">
            {resources.map((res) => (
              <div key={res.id} className="p-3.5 rounded-xl border border-[var(--border-card)] bg-theme-input/40 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-semibold text-theme-primary line-clamp-2">{res.title}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 shrink-0">
                    {res.subjectCode}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-theme-muted">
                  <span>by {res.uploadedBy}</span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3 text-theme-secondary" />
                    {res.downloadCount} downloads
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
