'use client';

import React, { useState } from 'react';
import { X, UserPlus, Check, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface GoogleAccountPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (email: string, name: string) => void;
}

const PRESET_ACCOUNTS = [
  {
    name: 'Durgesh Salunkhe',
    email: 'durgeshsalunkheetd@gmail.com',
    avatar: 'D',
    color: 'from-blue-600 to-indigo-600',
  },
  {
    name: 'Durgesh Patil',
    email: 'durgesh.patil@gmail.com',
    avatar: 'D',
    color: 'from-violet-600 to-purple-600',
  },
];

export function GoogleAccountPickerModal({
  isOpen,
  onClose,
  onSelectAccount,
}: GoogleAccountPickerModalProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailToUse = customEmail.trim() || 'student@gmail.com';
    const nameToUse = customName.trim() || emailToUse.split('@')[0];
    onSelectAccount(emailToUse, nameToUse);
    setIsCustomMode(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#0E131F] shadow-2xl overflow-hidden">
        {/* Google Header */}
        <div className="p-6 pb-4 border-b border-white/[0.08] text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white flex items-center justify-center shadow-lg ring-4 ring-white/10">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-extrabold text-white">Choose a Google Account</h3>
          <p className="text-xs text-slate-400 mt-1">
            to continue to <span className="font-semibold text-indigo-400">Exam-Buddy</span>
          </p>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {!isCustomMode ? (
            <>
              {/* Account List */}
              <div className="space-y-2">
                {PRESET_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => onSelectAccount(acc.email, acc.name)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] hover:border-indigo-500/40 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${acc.color} flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white/10`}
                      >
                        {acc.avatar}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          {acc.name}
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                            Verified
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {acc.email}
                        </div>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>

              <div className="h-px bg-white/[0.06] my-2" />

              {/* Use Another Account Button */}
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.06] hover:border-indigo-500/40 text-xs font-semibold text-slate-300 hover:text-white transition-all text-left"
              >
                <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-slate-300">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold">Use another Gmail account</div>
                  <div className="text-[10px] text-slate-400">Sign in with any custom email address</div>
                </div>
              </button>
            </>
          ) : (
            /* Custom Gmail Entry Form */
            <form onSubmit={handleCustomSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Gmail / Student Email</label>
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Continue with Google
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white/[0.02] border-t border-white/[0.06] text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Protected by Google OAuth 2.0 Secure Authentication</span>
        </div>
      </div>
    </div>
  );
}
