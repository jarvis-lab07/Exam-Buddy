"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Loader2,
  AlertCircle,
  Tag,
  BookOpen,
} from "lucide-react";
import { MOCK_SUBJECTS } from "@/lib/mock-data";
import { DocumentUploadItem, DocumentCategory } from "@/types";

interface FileDropzoneProps {
  onFileUploaded: (item: DocumentUploadItem) => void;
}

const CATEGORIES: DocumentCategory[] = [
  "Lecture Notes",
  "Syllabus / PPT",
  "Question Bank / PYQ",
  "Cheat Sheet",
  "Lab Manual",
];

type IngestionStage = "idle" | "uploading" | "extracting" | "vectorizing" | "completed";

export function FileDropzone({ onFileUploaded }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("dsa");
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>("Lecture Notes");
  const [stage, setStage] = useState<IngestionStage>("idle");
  const [progress, setProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState("");
  const [currentFileSize, setCurrentFileSize] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedSubject = MOCK_SUBJECTS.find((s) => s.id === selectedSubjectId) || MOCK_SUBJECTS[0];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setCurrentFileName(file.name);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setCurrentFileSize(`${sizeMb} MB`);

    // Start multi-stage vectorization simulation
    setStage("uploading");
    setProgress(15);

    // Stage 1: Uploading
    setTimeout(() => {
      setProgress(45);
      setStage("extracting");
    }, 700);

    // Stage 2: OCR & Text Extraction
    setTimeout(() => {
      setProgress(75);
      setStage("vectorizing");
    }, 1500);

    // Stage 3: Vector Embeddings
    setTimeout(() => {
      setProgress(100);
      setStage("completed");

      // Determine extension
      let fileType: "pdf" | "ppt" | "doc" | "notes" = "pdf";
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "ppt" || ext === "pptx") fileType = "ppt";
      else if (ext === "doc" || ext === "docx") fileType = "doc";
      else if (ext === "txt" || ext === "notes" || ext === "md") fileType = "notes";

      const newItem: DocumentUploadItem = {
        id: `doc-${Date.now()}`,
        title: file.name,
        subjectId: selectedSubject.id,
        subjectName: selectedSubject.name,
        subjectCode: selectedSubject.code,
        subjectColor: selectedSubject.color,
        unitTitle: selectedSubject.currentUnit?.title || "Core Syllabus Module",
        fileType,
        fileSize: `${sizeMb} MB`,
        category: selectedCategory,
        status: "vectorized",
        uploadDate: "Just now",
        pages: Math.max(4, Math.floor(Math.random() * 30) + 5),
        vectorCount: Math.floor(Math.random() * 200) + 60,
        summary: `Successfully parsed and indexed ${file.name}. Key concept vectors and exam definitions are ready for AI Tutor retrieval.`,
        keyTopics: [selectedSubject.name, selectedCategory, "Exam Formulas", "PYQ Target"],
      };

      onFileUploaded(newItem);

      // Reset after showing completion banner
      setTimeout(() => {
        setStage("idle");
        setProgress(0);
      }, 2500);
    }, 2400);
  };

  return (
    <div className="glass-card p-6 sm:p-7 rounded-2xl border border-white/[0.08] space-y-6">
      {/* Subject & Category Target Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2 border-b border-white/[0.06]">
        {/* Subject Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-violet-400" />
            Target Course / Subject
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            disabled={stage !== "idle"}
            className="w-full h-10 px-3 rounded-xl bg-[#141624] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-violet-500/50"
          >
            {MOCK_SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}: {s.name} ({s.degree})
              </option>
            ))}
          </select>
        </div>

        {/* Category Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-cyan-400" />
            Document Type / Classification
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                disabled={stage !== "idle"}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-violet-600 text-white border border-violet-500/40"
                    : "bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.05]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Drag & Drop Zone */}
      {stage === "idle" ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-10 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center space-y-4 cursor-pointer transition-all ${
            isDragging
              ? "border-violet-500 bg-violet-600/10"
              : "border-white/[0.12] hover:border-violet-500/50 hover:bg-white/[0.02]"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".pdf,.pptx,.ppt,.docx,.doc,.txt,.notes"
            className="hidden"
          />

          <div className="p-4 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/30">
            <UploadCloud className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-1.5 max-w-sm">
            <p className="text-sm font-semibold text-white">
              Drag & drop course materials here, or <span className="text-violet-400 underline">browse</span>
            </p>
            <p className="text-xs text-slate-400">
              Supports <span className="text-slate-300 font-mono">PDF, PPTX, DOCX, TXT</span> up to 50MB
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/[0.05]">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Automatic OCR + 768-dim pgvector indexing</span>
          </div>
        </div>
      ) : (
        /* Vectorization Progress Card */
        <div className="p-8 rounded-2xl bg-gradient-to-b from-[#16172B] to-[#0F101E] border border-violet-500/30 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white truncate max-w-xs">{currentFileName}</p>
                <p className="text-xs text-slate-400">{currentFileSize} • {selectedCategory}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {stage === "completed" ? (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Ready for AI
                </span>
              ) : (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> {progress}%
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 4 Pipeline Stages */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              progress >= 25 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-white/[0.02] border-white/[0.05] text-slate-500"
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] font-medium">1. Cloud Upload</span>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              progress >= 50 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-white/[0.02] border-white/[0.05] text-slate-500"
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] font-medium">2. OCR & Text</span>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              progress >= 75 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-white/[0.02] border-white/[0.05] text-slate-500"
            }`}>
              <Cpu className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] font-medium">3. Vectorizing</span>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              progress >= 100 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-white/[0.02] border-white/[0.05] text-slate-500"
            }`}>
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] font-medium">4. Indexed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
