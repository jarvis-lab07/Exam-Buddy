"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Bot,
  Eye,
  Trash2,
  CheckCircle2,
  Sparkles,
  Layers,
  Tag,
  Calendar,
  X,
  BookOpen,
} from "lucide-react";
import { DocumentUploadItem, DocumentCategory } from "@/types";

interface DocumentLibraryProps {
  documents: DocumentUploadItem[];
  onDeleteDocument: (id: string) => void;
}

export function DocumentLibrary({ documents, onDeleteDocument }: DocumentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activePreviewDoc, setActivePreviewDoc] = useState<DocumentUploadItem | null>(null);

  const categories = ["All", "Lecture Notes", "Syllabus / PPT", "Question Bank / PYQ", "Cheat Sheet"];

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.keyTopics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Vectorized Document Library
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
              {documents.length} Files
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Ingested notes indexed in pgvector and ready for retrieval in the AI Tutor.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents or topics..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#141624] border border-white/[0.08] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
          />
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-medium shrink-0 transition-all ${
              selectedCategory === cat
                ? "bg-indigo-600 text-white border border-indigo-500/40"
                : "bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.05]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Documents Grid / List */}
      {filteredDocs.length === 0 ? (
        <div className="glass-card p-10 rounded-2xl border border-white/[0.08] text-center space-y-3">
          <div className="p-3 rounded-2xl bg-white/[0.04] text-slate-400 w-fit mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-white">No documents found</p>
          <p className="text-xs text-slate-400">
            Try adjusting your search query or upload a new file above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="glass-card p-4 sm:p-5 rounded-2xl border border-white/[0.08] hover:border-violet-500/30 transition-all flex flex-col justify-between space-y-3.5 group"
            >
              {/* Top Row: File icon, Title, Badges */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-violet-600/15 text-violet-400 border border-violet-500/20 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                      style={{
                        backgroundColor: `${doc.subjectColor}20`,
                        color: doc.subjectColor,
                      }}
                    >
                      {doc.subjectCode}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                      {doc.category}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      {doc.vectorCount} Vectors
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white truncate mt-1.5 group-hover:text-violet-300 transition-colors">
                    {doc.title}
                  </h3>

                  {doc.unitTitle && (
                    <p className="text-xs text-[#9B99B5] truncate mt-0.5">
                      {doc.unitTitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Meta details & Tags */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-white/[0.04]">
                <span>{doc.fileSize}</span>
                <span>•</span>
                <span>{doc.pages} pages</span>
                <span>•</span>
                <span>{doc.uploadDate}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/chat?subject=${doc.subjectId}&q=Explain key concepts from ${encodeURIComponent(doc.title)}`}
                    className="h-7 px-2.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Ask AI</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setActivePreviewDoc(doc)}
                    className="h-7 px-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Summary</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteDocument(doc.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Summary Modal */}
      {activePreviewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-xl p-6 rounded-2xl border border-white/[0.1] bg-[#121320] shadow-2xl space-y-5 border-t-2 border-violet-500/40">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{activePreviewDoc.title}</h3>
                  <p className="text-xs text-slate-400">
                    {activePreviewDoc.subjectCode}: {activePreviewDoc.subjectName} • {activePreviewDoc.category}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActivePreviewDoc(null)}
                className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Summary Card */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
              <h4 className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                AI Syllabus Summary
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activePreviewDoc.summary}
              </p>
            </div>

            {/* Key Topics Chunks */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                Indexed Concept Vectors
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activePreviewDoc.keyTopics.map((topic, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Vector Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-[10px] text-slate-400">Total Pages</p>
                <p className="font-bold text-white mt-0.5">{activePreviewDoc.pages}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-[10px] text-slate-400">Embeddings</p>
                <p className="font-bold text-cyan-400 mt-0.5">{activePreviewDoc.vectorCount} chunks</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-[10px] text-slate-400">Status</p>
                <p className="font-bold text-emerald-400 mt-0.5">Vectorized ⚡</p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setActivePreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-300"
              >
                Close
              </button>
              <Link
                href={`/chat?subject=${activePreviewDoc.subjectId}&q=Explain key concepts from ${encodeURIComponent(activePreviewDoc.title)}`}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Launch in AI Tutor</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
