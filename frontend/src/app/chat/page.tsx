"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, Sparkles, Send, Paperclip } from "lucide-react";

function ChatContent() {
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject");

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-3xl border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Tutor Chat</h1>
            <p className="text-sm text-slate-400">
              {subject
                ? `Context locked to ${subject.toUpperCase()} course syllabus`
                : "Ask anything across your Semester 3 engineering syllabus"}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-3xl border border-white/[0.08] min-h-[400px] flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-sm text-slate-200 max-w-xl">
              Hello Durgesh! I am your Exam-Buddy AI tutor. What concept or problem can I clarify for you today?
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
          <input
            type="text"
            placeholder="Type your exam question or doubt here..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <button className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="text-slate-400 text-sm">Loading AI Tutor...</div>}>
      <ChatContent />
    </Suspense>
  );
}
