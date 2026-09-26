"use client";

import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  HardDrive,
  Cpu,
  Layers,
  Sparkles,
  Database,
  ArrowUpRight,
} from "lucide-react";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { DocumentLibrary } from "@/components/upload/DocumentLibrary";
import { MOCK_DOCUMENT_ITEMS, MOCK_USER } from "@/lib/mock-data";
import { DocumentUploadItem } from "@/types";

export default function UploadPage() {
  const [documents, setDocuments] = useState<DocumentUploadItem[]>(MOCK_DOCUMENT_ITEMS);

  // Load from localStorage if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem("exam_buddy_documents");
      if (stored) {
        setDocuments(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleFileUploaded = (item: DocumentUploadItem) => {
    setDocuments((prev) => {
      const updated = [item, ...prev];
      try {
        localStorage.setItem("exam_buddy_documents", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      try {
        localStorage.setItem("exam_buddy_documents", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const totalVectors = documents.reduce((acc, d) => acc + (d.vectorCount || 100), 0);
  const totalPages = documents.reduce((acc, d) => acc + (d.pages || 10), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner & Storage Gauge */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              Upload & Vectorization Center
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                pgvector RAG
              </span>
            </h1>
            <p className="text-sm text-[#9B99B5] max-w-xl">
              Ingest lecture slides, handwritten notes, and question banks. Exam-Buddy automatically extracts text, builds 768-dimensional embeddings, and routes them to your AI Tutor.
            </p>
          </div>
        </div>

        {/* Live Storage & Vectors Gauge */}
        <div className="glass-card p-4 rounded-2xl border border-white/[0.08] bg-black/20 min-w-[260px] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              Cloud Knowledge Storage
            </span>
            <span className="text-white font-bold">
              {MOCK_USER.cloudStorageUsedGB} / {MOCK_USER.cloudStorageTotalGB} GB
            </span>
          </div>

          {/* Storage bar */}
          <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
              style={{
                width: `${(MOCK_USER.cloudStorageUsedGB / MOCK_USER.cloudStorageTotalGB) * 100}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/[0.05]">
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3 text-emerald-400" />
              {totalVectors.toLocaleString()} vectors
            </span>
            <span>{totalPages} pages indexed</span>
          </div>
        </div>
      </div>

      {/* Dropzone for Ingestion */}
      <FileDropzone onFileUploaded={handleFileUploaded} />

      {/* Vectorized Document Library */}
      <DocumentLibrary
        documents={documents}
        onDeleteDocument={handleDeleteDocument}
      />
    </div>
  );
}
