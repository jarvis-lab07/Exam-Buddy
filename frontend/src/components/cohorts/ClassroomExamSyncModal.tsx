'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  Bell,
  MapPin,
  BookOpen,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Share2,
  CalendarCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export interface ClassroomExam {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  examDate: string; // ISO date string (YYYY-MM-DDTHH:mm)
  room: string;
  cohort: string; // e.g. "CO-CS-2026 (Sem 5)"
  unitsCovered: string;
  addedBy: string;
  syncedCount: number;
}

const INITIAL_COHORT_EXAMS: ClassroomExam[] = [
  {
    id: 'exam-1',
    title: 'Mid-Semester Theory Exam',
    subjectCode: 'CS501',
    subjectName: 'Advanced Data Structures & Algorithms',
    examDate: '2026-10-15T10:30',
    room: 'Hall B-204',
    cohort: 'Computer Engineering (B.Tech - Sem 5)',
    unitsCovered: 'Units 1, 2 & 3',
    addedBy: 'Durgesh (CR)',
    syncedCount: 42,
  },
  {
    id: 'exam-2',
    title: 'Unit Test II (Surprise Evaluation)',
    subjectCode: 'CS502',
    subjectName: 'Database Management Systems & SQL',
    examDate: '2026-10-22T14:00',
    room: 'Lab 3 (CS Dept)',
    cohort: 'Computer Engineering (B.Tech - Sem 5)',
    unitsCovered: 'Unit 4 (Indexing & Normalization)',
    addedBy: 'Prof. Sharma',
    syncedCount: 38,
  },
  {
    id: 'exam-3',
    title: 'End-Semester Final Practical Exam',
    subjectCode: 'CS503',
    subjectName: 'Computer Networks & Cybersecurity',
    examDate: '2026-11-05T09:00',
    room: 'Network Lab 1',
    cohort: 'Computer Engineering (B.Tech - Sem 5)',
    unitsCovered: 'All Units (1-5)',
    addedBy: 'Alex (Batch Rep)',
    syncedCount: 55,
  },
];

interface ClassroomExamSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClassroomExamSyncModal({ isOpen, onClose }: ClassroomExamSyncModalProps) {
  const { user } = useAuth();
  const [exams, setExams] = useState<ClassroomExam[]>(INITIAL_COHORT_EXAMS);
  const [syncedExamIds, setSyncedExamIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state for adding new exam
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newUnits, setNewUnits] = useState('Units 1 & 2');

  // Time remaining calculator
  const [timeRemaining, setTimeRemaining] = useState<Record<string, { days: number; hours: number; mins: number; secs: number }>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      const updatedTime: Record<string, { days: number; hours: number; mins: number; secs: number }> = {};
      exams.forEach((exam) => {
        const diff = new Date(exam.examDate).getTime() - new Date().getTime();
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const mins = Math.floor((diff / 1000 / 60) % 60);
          const secs = Math.floor((diff / 1000) % 60);
          updatedTime[exam.id] = { days, hours, mins, secs };
        } else {
          updatedTime[exam.id] = { days: 0, hours: 0, mins: 0, secs: 0 };
        }
      });
      setTimeRemaining(updatedTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [exams]);

  if (!isOpen) return null;

  const handleSyncToPlanner = (exam: ClassroomExam) => {
    if (syncedExamIds.includes(exam.id)) return;

    setSyncedExamIds((prev) => [...prev, exam.id]);
    setExams((prev) =>
      prev.map((e) => (e.id === exam.id ? { ...e, syncedCount: e.syncedCount + 1 } : e))
    );

    // Save to local storage for Planner page integration
    if (typeof window !== 'undefined') {
      const storedPlannerTasks = localStorage.getItem('exambuddy_planner_tasks') || '[]';
      try {
        const tasks = JSON.parse(storedPlannerTasks);
        tasks.push({
          id: `synced-exam-${exam.id}`,
          title: `📖 EXAM: ${exam.subjectCode} - ${exam.title}`,
          date: exam.examDate,
          room: exam.room,
          units: exam.unitsCovered,
          type: 'exam',
        });
        localStorage.setItem('exambuddy_planner_tasks', JSON.stringify(tasks));
      } catch (err) {
        console.error('Failed to sync to planner storage:', err);
      }
    }

    setToastMessage(`✅ Synced "${exam.subjectCode}: ${exam.title}" to your Study Planner!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCode || !newDate) return;

    const created: ClassroomExam = {
      id: `exam-${Date.now()}`,
      title: newTitle,
      subjectCode: newCode.toUpperCase(),
      subjectName: newName || 'Subject Examination',
      examDate: newDate,
      room: newRoom || 'Main Exam Hall',
      cohort: 'Computer Engineering (B.Tech - Sem 5)',
      unitsCovered: newUnits,
      addedBy: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Batch Student',
      syncedCount: 1,
    };

    setExams((prev) => [created, ...prev]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewCode('');
    setNewName('');
    setNewDate('');
    setNewRoom('');

    setToastMessage(`🎉 Shared exam timetable for ${created.subjectCode} published to Cohort!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0c0e1e] border border-violet-500/30 rounded-3xl shadow-2xl p-6 text-slate-100 overflow-hidden my-6">
        {/* Glow backdrop */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-violet-500/30">
              <CalendarCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Classroom Exam Sync & Countdowns
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Cohort Live
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Shared exam timetables synced across your batch & college cohort
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top duration-200">
            <span>{toastMessage}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
        )}

        {/* Action Header bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white/[0.03] border border-white/10 rounded-2xl">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <MapPin className="w-4 h-4 text-violet-400" />
            <span>Target Cohort:</span>
            <span className="font-bold text-white bg-violet-500/20 px-2.5 py-1 rounded-lg border border-violet-500/30">
              Computer Science & Engg • B.Tech Sem 5
            </span>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Cohort Exam</span>
          </button>
        </div>

        {/* ADD EXAM MODAL FORM OVERLAY */}
        {isAddModalOpen && (
          <form
            onSubmit={handleCreateExam}
            className="mt-4 p-4 bg-[#11142a] border border-violet-500/40 rounded-2xl space-y-3 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-sm font-bold text-violet-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-400" /> Add Shared Exam Timetable
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Exam Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Semester Theory Exam"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#181a38] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Subject Code & Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="CS504"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-24 bg-[#181a38] border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                  <input
                    type="text"
                    placeholder="Software Engineering"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 bg-[#181a38] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-[#181a38] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Exam Hall / Room & Units
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Hall A-102"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-1/2 bg-[#181a38] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                  <input
                    type="text"
                    placeholder="Units 1 to 4"
                    value={newUnits}
                    onChange={(e) => setNewUnits(e.target.value)}
                    className="w-1/2 bg-[#181a38] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold rounded-xl text-xs uppercase transition-colors"
              >
                Publish to Cohort Sync
              </button>
            </div>
          </form>
        )}

        {/* LIST OF SHARED EXAMS */}
        <div className="mt-4 space-y-4 max-h-[420px] overflow-y-auto pr-1">
          {exams.map((exam) => {
            const time = timeRemaining[exam.id] || { days: 0, hours: 0, mins: 0, secs: 0 };
            const isSynced = syncedExamIds.includes(exam.id);

            return (
              <div
                key={exam.id}
                className="p-4 bg-gradient-to-r from-[#101328] to-[#151836] border border-violet-500/20 rounded-2xl shadow-lg relative overflow-hidden group hover:border-violet-500/50 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Subject & Details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-lg bg-violet-600 text-white text-xs font-black tracking-wider">
                        {exam.subjectCode}
                      </span>
                      <h4 className="text-base font-extrabold text-white group-hover:text-violet-300 transition-colors">
                        {exam.subjectName}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-300 font-semibold">{exam.title}</p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {new Date(exam.examDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        {exam.room}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                        {exam.unitsCovered}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 pt-1 flex items-center gap-2">
                      <span>Shared by: {exam.addedBy}</span>
                      <span>•</span>
                      <span className="text-violet-400 font-medium flex items-center gap-1">
                        <Users className="w-3 h-3" /> {exam.syncedCount} Classmates Synced
                      </span>
                    </div>
                  </div>

                  {/* Countdown Timer Widget & Sync CTA */}
                  <div className="flex flex-col items-end justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2 bg-[#090a14] border border-violet-500/30 px-3 py-2 rounded-2xl shadow-inner">
                      <div className="text-center">
                        <span className="text-base font-black text-amber-400 font-mono">
                          {String(time.days).padStart(2, '0')}
                        </span>
                        <span className="block text-[9px] uppercase font-bold text-slate-500">
                          Days
                        </span>
                      </div>
                      <span className="text-slate-600 font-mono text-sm">:</span>
                      <div className="text-center">
                        <span className="text-base font-black text-white font-mono">
                          {String(time.hours).padStart(2, '0')}
                        </span>
                        <span className="block text-[9px] uppercase font-bold text-slate-500">
                          Hrs
                        </span>
                      </div>
                      <span className="text-slate-600 font-mono text-sm">:</span>
                      <div className="text-center">
                        <span className="text-base font-black text-white font-mono">
                          {String(time.mins).padStart(2, '0')}
                        </span>
                        <span className="block text-[9px] uppercase font-bold text-slate-500">
                          Min
                        </span>
                      </div>
                      <span className="text-slate-600 font-mono text-sm">:</span>
                      <div className="text-center">
                        <span className="text-base font-black text-violet-400 font-mono">
                          {String(time.secs).padStart(2, '0')}
                        </span>
                        <span className="block text-[9px] uppercase font-bold text-slate-500">
                          Sec
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSyncToPlanner(exam)}
                      disabled={isSynced}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md ${
                        isSynced
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40 cursor-default'
                          : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/30'
                      }`}
                    >
                      {isSynced ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Synced to Planner</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Sync to My Planner</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[11px]">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Live exam countdown updates automatically for all students in your cohort.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
