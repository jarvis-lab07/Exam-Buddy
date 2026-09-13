"use client";

import React from "react";
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react";
import { MOCK_RECENT_DOCUMENTS } from "@/lib/mock-data";

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-3xl border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Upload Center</h1>
            <p className="text-sm text-slate-400">
              Upload PDF lecture notes, syllabus slides, and question banks for AI vectorization
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-10 rounded-3xl border-2 border-dashed border-white/[0.15] hover:border-indigo-500/50 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer transition-colors">
        <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400">
          <UploadCloud className="w-8 h-8" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">
            Drag & drop course files here, or <span className="text-indigo-400 underline">browse</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">Supports PDF, PPTX, DOCX up to 50MB</p>
        </div>
      </div>
    </div>
  );
}
