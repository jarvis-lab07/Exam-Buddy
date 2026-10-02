'use client';

import React, { useState } from 'react';
import {
  Folder,
  FileText,
  Cloud,
  CheckCircle2,
  Lock,
  Search,
  DownloadCloud,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: 'pdf' | 'docx' | 'folder' | 'image';
  size: string;
  modified: string;
  selected?: boolean;
}

const SAMPLE_DRIVE_FILES: DriveFile[] = [
  { id: 'f1', name: 'Computer_Networks_Unit3_Notes.pdf', mimeType: 'pdf', size: '4.2 MB', modified: 'Oct 1, 2026' },
  { id: 'f2', name: 'DBMS_Normalization_Question_Bank.pdf', mimeType: 'pdf', size: '2.8 MB', modified: 'Sep 28, 2026' },
  { id: 'f3', name: 'Algorithms_Lab_Manual_2026.docx', mimeType: 'docx', size: '1.5 MB', modified: 'Sep 25, 2026' },
  { id: 'f4', name: 'PYQ_5Year_Solved_Papers.pdf', mimeType: 'pdf', size: '8.4 MB', modified: 'Sep 20, 2026' },
  { id: 'f5', name: 'Lecture_Diagrams_Scan.png', mimeType: 'image', size: '3.1 MB', modified: 'Sep 15, 2026' },
];

interface GoogleDrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportFiles?: (importedNames: string[]) => void;
}

export function GoogleDrivePickerModal({ isOpen, onClose, onImportFiles }: GoogleDrivePickerModalProps) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(true);
  const [files, setFiles] = useState<DriveFile[]>(SAMPLE_DRIVE_FILES);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSelectFile = (id: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConnectDrive = () => {
    setIsConnected(true);
    setToastMsg('✅ Google Drive connected successfully via BYOS OAuth!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleImportSelected = () => {
    if (selectedFileIds.length === 0) return;
    setIsImporting(true);

    const importedNames = files
      .filter((f) => selectedFileIds.includes(f.id))
      .map((f) => f.name);

    setTimeout(() => {
      setIsImporting(false);
      if (onImportFiles) onImportFiles(importedNames);

      setToastMsg(`🎉 Successfully imported & RAG vectorized ${selectedFileIds.length} document(s) from Google Drive!`);
      setTimeout(() => {
        setToastMsg(null);
        onClose();
      }, 1500);
    }, 1200);
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0c0e20] border border-blue-500/30 rounded-3xl shadow-2xl p-6 text-slate-100 overflow-hidden my-6">
        {/* Glow backdrop */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-violet-600/25 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-600/30">
              <Cloud className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Google Drive Storage Integration (BYOS)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  BYOS Cloud
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Import lecture notes & syllabus documents directly from your personal Google Drive
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

        {/* Toast alert */}
        {toastMsg && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top duration-200">
            <span>{toastMsg}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
        )}

        {/* Connection Status & Search Bar */}
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white/[0.03] border border-white/10 rounded-2xl text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">Connected Account:</span>
              <span className="font-bold text-white bg-blue-500/20 px-2 py-0.5 rounded-lg border border-blue-500/30">
                {user?.email || 'student.drive@gmail.com'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Read-Only Document Access
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search documents in Google Drive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#12142d] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* File Grid Selector */}
        <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {filteredFiles.map((file) => {
            const isSelected = selectedFileIds.includes(file.id);
            return (
              <div
                key={file.id}
                onClick={() => toggleSelectFile(file.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-blue-950/60 border-blue-500/60 shadow-lg shadow-blue-600/10'
                    : 'bg-[#121429] hover:bg-white/[0.05] border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 text-blue-400 border border-white/10'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide">{file.name}</h4>
                    <p className="text-[10px] text-slate-400">
                      Size: {file.size} • Last modified: {file.modified}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-blue-600 border-blue-400 text-white'
                      : 'border-slate-600 bg-black/40'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Selected: <strong className="text-white">{selectedFileIds.length}</strong> file(s)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-xl border border-white/10 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleImportSelected}
              disabled={selectedFileIds.length === 0 || isImporting}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>{isImporting ? 'Importing & Vectorizing...' : 'Import to Exam-Buddy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
