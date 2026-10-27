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
  CheckCircle2,
  Cloud,
} from "lucide-react";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { DocumentLibrary } from "@/components/upload/DocumentLibrary";
import { GoogleDrivePickerModal } from "@/components/upload/GoogleDrivePickerModal";
import { MOCK_DOCUMENT_ITEMS, MOCK_USER } from "@/lib/mock-data";
import { DocumentUploadItem } from "@/types";
import { isDriveConnectedInStorage, getDriveStorageQuota } from "@/lib/google-drive-service";

export default function UploadPage() {
  const [documents, setDocuments] = useState<DocumentUploadItem[]>(MOCK_DOCUMENT_ITEMS);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  // Load and sanitize from localStorage if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem("exam_buddy_documents");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const sanitized: DocumentUploadItem[] = parsed.map((d: any) => ({
            id: d.id || `doc-${Date.now()}`,
            title: d.title || d.name || "Study Document",
            subjectId: d.subjectId || "cs501",
            subjectName: d.subjectName || d.subject || "General Knowledge",
            subjectCode: d.subjectCode || "GK101",
            subjectColor: d.subjectColor || "#3B82F6",
            unitTitle: d.unitTitle || undefined,
            fileType: d.fileType || "pdf",
            fileSize: d.fileSize || d.size || "2.5 MB",
            category: d.category || "Lecture Notes",
            status: d.status === "completed" ? "ready" : (d.status || "ready"),
            uploadDate: d.uploadDate || d.uploadedAt || "Recently",
            pages: d.pages || 10,
            vectorCount: d.vectorCount || 150,
            summary: d.summary || "Imported study material.",
            keyTopics: Array.isArray(d.keyTopics) ? d.keyTopics : ["Study Notes", "pgvector RAG"],
            extractedQuestions: Array.isArray(d.extractedQuestions) ? d.extractedQuestions : [],
          }));
          setDocuments(sanitized);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleFileUploaded = (item: any) => {
    const sanitizedItem: DocumentUploadItem = {
      id: item.id || `doc-${Date.now()}`,
      title: item.title || item.name || "Imported Document",
      subjectId: item.subjectId || "cs501",
      subjectName: item.subjectName || item.subject || "General Knowledge",
      subjectCode: item.subjectCode || "GK101",
      subjectColor: item.subjectColor || "#3B82F6",
      unitTitle: item.unitTitle || undefined,
      fileType: item.fileType || (item.name?.endsWith(".docx") ? "doc" : "pdf"),
      fileSize: item.fileSize || item.size || "3.2 MB",
      category: item.category || "Lecture Notes",
      status: item.status === "completed" ? "ready" : (item.status || "ready"),
      uploadDate: item.uploadDate || item.uploadedAt || "Just now",
      pages: item.pages || 14,
      vectorCount: item.vectorCount || 210,
      summary: item.summary || "Imported from personal Google Drive storage.",
      keyTopics: Array.isArray(item.keyTopics) ? item.keyTopics : ["Google Drive Sync", "Cloud Notes", "pgvector RAG"],
      extractedQuestions: Array.isArray(item.extractedQuestions) ? item.extractedQuestions : [],
    };

    setDocuments((prev) => {
      const updated = [sanitizedItem, ...prev];
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

  // Google Drive BYOS Connection & Quota State
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [driveQuota, setDriveQuota] = useState<{ usageGB: number; limitGB: number; email?: string } | null>(null);

  useEffect(() => {
    const checkDrive = async () => {
      const connected = isDriveConnectedInStorage();
      setIsDriveConnected(connected);
      if (connected) {
        const quota = await getDriveStorageQuota();
        if (quota) setDriveQuota(quota);
      }
    };
    checkDrive();
  }, [isDriveModalOpen]);

  const totalVectors = documents.reduce((acc, d) => acc + (d.vectorCount || 100), 0);
  const totalPages = documents.reduce((acc, d) => acc + (d.pages || 10), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner & Google Drive BYOS Storage Hub */}
      <div className="glass-card p-6 sm:p-7 rounded-2xl border border-[var(--border-card)] border-t-2 border-blue-500/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/25 shrink-0">
            <Cloud className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                Upload & Google Drive BYOS Hub
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                Student-Owned Drive (BYOS)
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)] max-w-xl">
              Exam-Buddy uses your own personal Google Drive for 100% free, private storage. Upload notes, sync study materials, and share Drive links with peers—without consuming server storage.
            </p>
          </div>
        </div>

        {/* Live Personal Google Drive BYOS Gauge */}
        <div className="glass-card p-4 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-elevated)] min-w-[280px] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)] flex items-center gap-1.5 font-medium">
              <Cloud className="w-3.5 h-3.5 text-blue-400" />
              Personal Google Drive
            </span>
            <span className="text-[var(--text-primary)] font-bold">
              {driveQuota ? `${driveQuota.usageGB} / ${driveQuota.limitGB} GB` : "15 GB Free Tier"}
            </span>
          </div>

          {/* Storage bar */}
          <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              style={{
                width: `${driveQuota ? Math.min(100, (driveQuota.usageGB / driveQuota.limitGB) * 100) : 25}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-card)]">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              0 MB Server Cost
            </span>
            <button
              type="button"
              onClick={() => setIsDriveModalOpen(true)}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors flex items-center gap-1"
            >
              <span>{isDriveConnected ? "Open Drive" : "Connect Drive"}</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
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

      {/* Google Drive BYOS Picker Modal */}
      <GoogleDrivePickerModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        onFileUploaded={handleFileUploaded}
      />
    </div>
  );
}
