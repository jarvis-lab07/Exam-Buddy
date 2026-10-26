'use client';

import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Loader2,
  LogOut,
  RefreshCw,
  FolderSync,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DriveItem,
  getStoredDriveAccessToken,
  isDriveConnectedInStorage,
  requestDriveAccessToken,
  fetchDriveFilesList,
  importGoogleDriveFile,
  disconnectGoogleDrive,
  openGooglePicker,
} from '@/lib/google-drive-service';
import { DocumentUploadItem } from '@/types';

interface GoogleDrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportFiles?: (importedNames: string[]) => void;
  onFileUploaded?: (doc: DocumentUploadItem) => void;
}

type ConnectionState =
  | 'not_connected'
  | 'connecting'
  | 'connected'
  | 'importing'
  | 'expired'
  | 'error';

export function GoogleDrivePickerModal({
  isOpen,
  onClose,
  onImportFiles,
  onFileUploaded,
}: GoogleDrivePickerModalProps) {
  const { user } = useAuth();
  const [connectionState, setConnectionState] = useState<ConnectionState>('not_connected');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [files, setFiles] = useState<DriveItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Import Progress tracking
  const [importProgress, setImportProgress] = useState<{
    current: number;
    total: number;
    fileName: string;
  } | null>(null);

  // Check stored connection on mount or modal open
  useEffect(() => {
    if (isOpen) {
      const storedToken = getStoredDriveAccessToken();
      const isConnected = isDriveConnectedInStorage();

      if (storedToken && isConnected) {
        setAccessToken(storedToken);
        setConnectionState('connected');
        loadFiles(storedToken);
      } else {
        setConnectionState('not_connected');
        setFiles([]);
        setSelectedFileIds([]);
      }
    }
  }, [isOpen]);

  const loadFiles = async (token: string, search?: string) => {
    setLoadingFiles(true);
    setErrorMsg(null);

    const res = await fetchDriveFilesList(token, search);
    if (res.expired) {
      setConnectionState('expired');
      setErrorMsg('Your Google Drive authorization has expired. Please reconnect.');
      setFiles([]);
    } else if (res.error) {
      setErrorMsg(res.error);
    } else {
      setFiles(res.files);
    }
    setLoadingFiles(false);
  };

  const handleConnect = async () => {
    setErrorMsg(null);
    setConnectionState('connecting');

    const result = await requestDriveAccessToken();
    if (result.error || !result.accessToken) {
      setConnectionState('error');
      setErrorMsg(result.error || 'Failed to authorize Google Drive');
      return;
    }

    setAccessToken(result.accessToken);
    setConnectionState('connected');
    setToastMsg(
      result.isSimulated
        ? 'Connected in Development Mode (Simulated BYOS). Live Google Cloud Client ID will activate real Google consent.'
        : 'Google Drive connected successfully with narrow drive.file scope!'
    );
    setTimeout(() => setToastMsg(null), 4000);

    await loadFiles(result.accessToken);
  };

  const handleDisconnect = async () => {
    if (accessToken) {
      await disconnectGoogleDrive(accessToken, user?.id);
    }
    setAccessToken(null);
    setConnectionState('not_connected');
    setFiles([]);
    setSelectedFileIds([]);
    setToastMsg('Google Drive disconnected.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleOpenNativePicker = async () => {
    if (!accessToken) return;
    const opened = await openGooglePicker({
      accessToken,
      onSelect: (selected) => {
        // Automatically import picked files
        handleImportDirectList(selected);
      },
    });

    if (!opened) {
      setToastMsg('Google Picker widget requires NEXT_PUBLIC_GOOGLE_API_KEY. Using built-in browser below.');
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  const handleImportDirectList = async (
    items: { id: string; name: string; mimeType: string }[]
  ) => {
    if (!accessToken || items.length === 0) return;
    setConnectionState('importing');
    const importedDocs: any[] = [];
    const importedNames: string[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      setImportProgress({
        current: i + 1,
        total: items.length,
        fileName: item.name,
      });

      const res = await importGoogleDriveFile({
        fileId: item.id,
        fileName: item.name,
        mimeType: item.mimeType,
        accessToken,
      });

      if (res.success && res.document) {
        importedDocs.push(res.document);
        importedNames.push(item.name);
        if (onFileUploaded) onFileUploaded(res.document);
      }
    }

    setConnectionState('connected');
    setImportProgress(null);
    setSelectedFileIds([]);

    if (onImportFiles && importedNames.length > 0) {
      onImportFiles(importedNames);
    }

    setToastMsg(
      `Successfully imported ${importedDocs.length} study document(s) from Google Drive into Exam-Buddy!`
    );
    setTimeout(() => {
      setToastMsg(null);
      onClose();
    }, 1500);
  };

  const handleImportSelected = async () => {
    if (selectedFileIds.length === 0 || !accessToken) return;
    const selectedItems = files.filter((f) => selectedFileIds.includes(f.id));
    await handleImportDirectList(
      selectedItems.map((f) => ({
        id: f.id,
        name: f.name,
        mimeType: f.rawMimeType || 'application/pdf',
      }))
    );
  };

  const toggleSelectFile = (id: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (accessToken) {
      loadFiles(accessToken, val);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-card)] rounded-3xl shadow-2xl p-6 text-[var(--text-primary)] overflow-hidden my-6">
        {/* Glow backdrop */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-600/25">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                  Google Drive Storage (BYOS)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  drive.file Scope
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Import study notes, question banks, and slides with least-privilege permission
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-600 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in slide-in-from-top duration-200">
            <span>{toastMsg}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-600 dark:text-rose-300 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            {connectionState === 'expired' && (
              <button
                onClick={handleConnect}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-[11px] font-bold text-rose-600 dark:text-rose-200 transition-colors"
              >
                Reconnect
              </button>
            )}
          </div>
        )}

        {/* Progress Bar (Importing State) */}
        {connectionState === 'importing' && importProgress && (
          <div className="mt-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Ingesting {importProgress.fileName}...
              </span>
              <span className="font-bold text-[var(--text-primary)]">
                {importProgress.current} / {importProgress.total} Files
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--input-bg)] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
                style={{
                  width: `${(importProgress.current / importProgress.total) * 100}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Extracting text chunks, generating 1536-dimensional vector embeddings, and storing in pgvector.
            </p>
          </div>
        )}

        {/* Connection State Views */}
        {connectionState === 'not_connected' ? (
          <div className="mt-6 py-8 px-6 text-center space-y-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-card)]">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-500">
              <Cloud className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Connect Your Personal Google Drive
              </h3>
              <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                Exam-Buddy requests only the narrow <code className="text-violet-500 font-mono">drive.file</code> scope.
                We never read your private drive files—only documents you explicitly choose to import.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleConnect}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 inline-flex items-center gap-2 cursor-pointer"
              >
                <Cloud className="w-4 h-4" />
                <span>Connect Google Drive</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {/* Account Status bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[var(--bg-elevated)] border border-[var(--border-card)] rounded-2xl text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[var(--text-muted)] font-medium">Connected Account:</span>
                <span className="font-semibold text-[var(--text-primary)] bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/25">
                  {user?.email || 'student.drive@gmail.com'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenNativePicker}
                  className="px-2.5 py-1 rounded-lg bg-[var(--input-bg)] hover:bg-[var(--bg-surface)] text-[11px] font-semibold text-blue-500 border border-[var(--border-card)] transition-colors flex items-center gap-1.5"
                  title="Launch Google Cloud Picker window"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Google Picker</span>
                </button>

                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-[11px] font-semibold text-rose-500 border border-rose-500/25 transition-colors flex items-center gap-1.5"
                  title="Disconnect and revoke Google Drive token"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>

            {/* Search and Refresh Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search PDFs, Docs, or notes in Google Drive..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--border-card)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={() => accessToken && loadFiles(accessToken, searchQuery)}
                disabled={loadingFiles}
                className="p-2 rounded-xl bg-[var(--input-bg)] hover:bg-[var(--bg-elevated)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
                title="Refresh Drive files"
              >
                <RefreshCw className={`w-4 h-4 ${loadingFiles ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* File List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {loadingFiles ? (
                <div className="py-12 text-center text-xs text-[var(--text-muted)] flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span>Browsing Google Drive files...</span>
                </div>
              ) : files.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--text-muted)] space-y-1">
                  <FolderSync className="w-8 h-8 mx-auto text-[var(--text-muted)] opacity-50" />
                  <p className="font-semibold text-[var(--text-secondary)]">No supported files found</p>
                  <p className="text-[11px]">
                    Exam-Buddy supports PDFs, DOCX, TXT, and Google Docs. Try searching or launch Google Picker.
                  </p>
                </div>
              ) : (
                files.map((file) => {
                  const isSelected = selectedFileIds.includes(file.id);
                  return (
                    <div
                      key={file.id}
                      onClick={() => toggleSelectFile(file.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-500/10 border-blue-500/60 shadow-md shadow-blue-500/10'
                          : 'bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)] border-[var(--border-card)]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
                            {file.name}
                          </h4>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                            Size: {file.size} • Modified: {file.modified}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'border-[var(--border-card)] bg-[var(--input-bg)]'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Actions */}
            <div className="mt-4 pt-3 border-t border-[var(--border-card)] flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">
                Selected: <strong className="text-[var(--text-primary)]">{selectedFileIds.length}</strong> file(s)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-[var(--input-bg)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] font-semibold rounded-xl border border-[var(--border-card)] transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleImportSelected}
                  disabled={selectedFileIds.length === 0 || connectionState === 'importing'}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span>{connectionState === 'importing' ? 'Importing...' : 'Import to Exam-Buddy'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
