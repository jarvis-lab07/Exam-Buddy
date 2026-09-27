'use client';

import React, { useEffect, useState } from 'react';
import { Users, Flame, Award, Download, Share2, Sparkles, Trophy } from 'lucide-react';
import { fetchDepartmentLeaderboard, fetchCohortKnowledgePool, CohortStudentLeaderboard, SharedCohortResource } from '@/lib/cohort-service';

export function CampusCohortCard() {
  const [leaderboard, setLeaderboard] = useState<CohortStudentLeaderboard[]>([]);
  const [resources, setResources] = useState<SharedCohortResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCohortData() {
      const [boardData, poolData] = await Promise.all([
        fetchDepartmentLeaderboard('VJTI Mumbai', 'Computer Engineering'),
        fetchCohortKnowledgePool(),
      ]);
      setLeaderboard(boardData);
      setResources(poolData);
      setLoading(false);
    }
    loadCohortData();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 my-6">
      {/* Campus Cohort Info & Knowledge Pool (2 cols) */}
      <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/15 text-indigo-400 rounded-xl border border-indigo-500/25">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Campus Cohort Knowledge Pool
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                  VJTI CS 2026
                </span>
              </h3>
              <p className="text-xs text-slate-400">Crowdsourced lecture notes & verified PYQs from your classmates</p>
            </div>
          </div>
        </div>

        {/* Shared Resource Cards */}
        <div className="space-y-2.5">
          {resources.map((res) => (
            <div
              key={res.id}
              className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] hover:border-indigo-500/30 flex items-center justify-between transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                    {res.subjectCode}
                  </span>
                  <h4 className="text-xs font-semibold text-white">{res.title}</h4>
                </div>
                <p className="text-[11px] text-slate-400">
                  Uploaded by <span className="text-indigo-400 font-medium">{res.uploadedBy}</span> • {res.uploadTime} • {res.vectorCount} vector chunks
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Download className="w-3 h-3 text-slate-500" /> {res.downloadCount}
                </span>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-indigo-200" /> Sync to AI
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Study Leaderboard (1 col) */}
      <div className="glass-card p-6 rounded-2xl border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Department Leaderboard</h3>
          </div>
          <span className="text-[10px] text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            Weekly Focus
          </span>
        </div>

        <div className="space-y-2">
          {leaderboard.map((student) => (
            <div
              key={student.handle}
              className={`p-2.5 rounded-xl flex items-center justify-between border text-xs transition-all ${
                student.rank === 1
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-white/[0.02] border-white/[0.05] text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  student.rank === 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {student.rank}
                </span>
                <div>
                  <p className="font-semibold text-white leading-none">{student.name}</p>
                  <p className="text-[10px] text-slate-400">{student.handle}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                  <Flame className="w-3 h-3 fill-amber-400/30" /> {student.streakDays}d
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  {student.weeklyFocusMinutes}m
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
