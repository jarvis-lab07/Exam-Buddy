"use client";

import React, { useState, useEffect } from "react";
import {
  Video,
  Play,
  Bookmark,
  FileText,
  HelpCircle,
  Layers,
  Sparkles,
  Link as LinkIcon,
  Search,
  BookOpen,
  Plus,
  Clock,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { YouTubePlayer } from "@/components/lecture/YouTubePlayer";
import { BookmarkManager } from "@/components/lecture/BookmarkManager";
import { LectureAiTutor } from "@/components/lecture/LectureAiTutor";
import { LectureNotesPanel } from "@/components/lecture/LectureNotesPanel";
import { LectureQuizPanel } from "@/components/lecture/LectureQuizPanel";
import { LectureFlashcardsPanel } from "@/components/lecture/LectureFlashcardsPanel";
import {
  extractYouTubeVideoId,
  formatTimestamp,
  getWorkspaceByVideoId,
  saveWorkspace,
  MOCK_LECTURE_DEMO,
  LectureWorkspaceData,
  TimestampBookmark,
  LectureNote,
} from "@/lib/youtube-service";
import { cn } from "@/lib/utils";

export default function YouTubeStudyWorkspacePage() {
  const [workspace, setWorkspace] = useState<LectureWorkspaceData>(MOCK_LECTURE_DEMO);
  const [urlInput, setUrlInput] = useState("");
  const [currentTimestampSec, setCurrentTimestampSec] = useState(workspace.lastWatchedTimestampSec);
  const [seekToTimeSec, setSeekToTimeSec] = useState<number | null>(null);
  const [activeBottomTab, setActiveBottomTab] = useState<"notes" | "bookmarks" | "quiz" | "flashcards" | "resources">("notes");
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);

  // Load stored workspace on mount or when video ID changes
  useEffect(() => {
    try {
      const stored = getWorkspaceByVideoId(workspace.videoId);
      if (stored) {
        setWorkspace(stored);
        setCurrentTimestampSec(stored.lastWatchedTimestampSec);
      }
    } catch (e) {
      console.error(e);
    }
  }, [workspace.videoId]);

  const handleOpenYouTubeUrl = (urlToParse?: string) => {
    const targetUrl = urlToParse || urlInput;
    const extractedId = extractYouTubeVideoId(targetUrl);
    if (!extractedId) {
      alert("Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=...)");
      return;
    }

    const newWorkspace: LectureWorkspaceData = {
      id: `lec-${extractedId}`,
      youtubeUrl: targetUrl,
      videoId: extractedId,
      title: `YouTube AI Lecture (${extractedId})`,
      thumbnailUrl: `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`,
      durationSec: 3600,
      lastWatchedTimestampSec: 0,
      completionPercent: 0,
      subjectName: "Computer Science & Engineering",
      topicTitle: "University Lecture Workspace",
      unitTitle: "Unit 3 · Advanced Topics",
      bookmarks: [],
      notes: [],
      chatHistory: [],
      updatedAt: new Date().toISOString(),
    };

    setWorkspace(newWorkspace);
    saveWorkspace(newWorkspace);
    setCurrentTimestampSec(0);
    setUrlInput("");
    setIsUrlModalOpen(false);
  };

  const handleSelectBookmark = (timestampSec: number) => {
    setSeekToTimeSec(timestampSec);
    // Clear seek trigger after brief delay
    setTimeout(() => setSeekToTimeSec(null), 300);
  };

  const handleAddBookmark = (newBm: TimestampBookmark) => {
    const updatedBms = [newBm, ...workspace.bookmarks];
    const updatedWorkspace = { ...workspace, bookmarks: updatedBms };
    setWorkspace(updatedWorkspace);
    saveWorkspace(updatedWorkspace);
  };

  const handleDeleteBookmark = (id: string) => {
    const updatedBms = workspace.bookmarks.filter((b) => b.id !== id);
    const updatedWorkspace = { ...workspace, bookmarks: updatedBms };
    setWorkspace(updatedWorkspace);
    saveWorkspace(updatedWorkspace);
  };

  const handleAddNote = (newNote: LectureNote) => {
    const updatedNotes = [newNote, ...workspace.notes];
    const updatedWorkspace = { ...workspace, notes: updatedNotes };
    setWorkspace(updatedWorkspace);
    saveWorkspace(updatedWorkspace);
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = workspace.notes.filter((n) => n.id !== id);
    const updatedWorkspace = { ...workspace, notes: updatedNotes };
    setWorkspace(updatedWorkspace);
    saveWorkspace(updatedWorkspace);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & URL Switcher */}
      <div className="glass-card p-5 rounded-2xl border border-white/[0.08] border-t-2 border-red-500/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-3 rounded-2xl bg-red-500/15 text-red-400 border border-red-500/30 shrink-0">
            <Video className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                YouTube AI Study Workspace
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                {workspace.subjectName}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white truncate mt-0.5" title={workspace.title}>
              {workspace.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsUrlModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Load YouTube URL</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Section: Left (Video) | Right (AI Tutor Chat) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: YouTube Player (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <YouTubePlayer
            videoId={workspace.videoId}
            initialTimestampSec={workspace.lastWatchedTimestampSec}
            onTimeUpdate={(t) => setCurrentTimestampSec(t)}
            onQuickBookmark={(t) => {
              const quickBm: TimestampBookmark = {
                id: `bm-${Date.now()}`,
                timestampSec: t,
                timestampFormatted: formatTimestamp(t),
                title: `Bookmark at ${formatTimestamp(t)}`,
                type: "Important",
                createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              };
              handleAddBookmark(quickBm);
            }}
            seekToTimeSec={seekToTimeSec}
          />

          {/* Quick Stats Bar */}
          <div className="glass-card p-4 rounded-xl border border-white/[0.08] flex items-center justify-between text-xs text-[#9B99B5] flex-wrap gap-2">
            <span className="flex items-center gap-1.5 font-mono text-white">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Current Position: <span className="text-amber-300 font-bold">{formatTimestamp(currentTimestampSec)}</span>
            </span>
            <span>{workspace.bookmarks.length} Bookmarks</span>
            <span>{workspace.notes.length} AI Notes</span>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Tutor Chat (5 cols) */}
        <div className="lg:col-span-5">
          <LectureAiTutor
            workspace={workspace}
            currentTimestampSec={currentTimestampSec}
            onSaveAsNote={(content, title) => {
              const note: LectureNote = {
                id: `note-${Date.now()}`,
                timestampSec: currentTimestampSec,
                title: title || `AI Note [${formatTimestamp(currentTimestampSec)}]`,
                content,
                type: "custom",
                createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              };
              handleAddNote(note);
              setActiveBottomTab("notes");
            }}
            onAddBookmark={handleAddBookmark}
            onTriggerQuiz={() => setActiveBottomTab("quiz")}
            onTriggerFlashcards={() => setActiveBottomTab("flashcards")}
          />
        </div>
      </div>

      {/* BOTTOM PANEL: Resizable Tabbed Workspace */}
      <div className="glass-card rounded-2xl border border-white/[0.08] p-5 space-y-4 bg-[#0A0A14] shadow-2xl">
        {/* Bottom Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: "notes", label: `Smart Notes (${workspace.notes.length})`, icon: FileText },
            { id: "bookmarks", label: `Timestamp Bookmarks (${workspace.bookmarks.length})`, icon: Bookmark },
            { id: "quiz", label: "AI Practice Quiz", icon: HelpCircle },
            { id: "flashcards", label: "3D Flashcards Deck", icon: Layers },
            { id: "resources", label: "Lecture Resources & RAG", icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeBottomTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveBottomTab(tab.id as any)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0",
                  isActive
                    ? "bg-violet-600/25 text-violet-200 border border-violet-500/40 shadow-sm"
                    : "text-[#9B99B5] hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Icon className="w-3.5 h-3.5 text-violet-400" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Rendering */}
        <div className="pt-2">
          {activeBottomTab === "notes" && (
            <LectureNotesPanel
              notes={workspace.notes}
              currentTimestampSec={currentTimestampSec}
              lectureTitle={workspace.title}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
            />
          )}

          {activeBottomTab === "bookmarks" && (
            <BookmarkManager
              bookmarks={workspace.bookmarks}
              currentTimestampSec={currentTimestampSec}
              onSelectBookmark={handleSelectBookmark}
              onAddBookmark={handleAddBookmark}
              onDeleteBookmark={handleDeleteBookmark}
            />
          )}

          {activeBottomTab === "quiz" && (
            <LectureQuizPanel lectureTitle={workspace.title} />
          )}

          {activeBottomTab === "flashcards" && (
            <LectureFlashcardsPanel lectureTitle={workspace.title} />
          )}

          {activeBottomTab === "resources" && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="glass-card p-4 rounded-xl border border-white/[0.08] space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  Syllabus Vector Indexing & Reference Materials
                </h4>
                <p className="text-[11px] text-[#9B99B5]">
                  This YouTube lecture is indexed in Exam Buddy's RAG knowledge base. AI Tutor uses both the video context and your uploaded course docs.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Load YouTube URL Modal */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 rounded-2xl border border-white/[0.1] space-y-4 bg-[#0A0A14]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-red-500" />
                Open YouTube AI Lecture Workspace
              </h3>
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                className="text-[#9B99B5] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9B99B5] mb-1.5">
                Paste YouTube Lecture Link or Video ID:
              </label>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#13131F] border border-white/[0.1] text-white text-xs focus:outline-none focus:border-red-500"
                autoFocus
              />
            </div>

            {/* Demo Shortcut Links */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#9B99B5] uppercase">Or try sample university lectures:</span>
              <div className="space-y-1">
                {[
                  { title: "MIT 6.006: Introduction to Algorithms", url: "https://www.youtube.com/watch?v=ZaKkQfZ6Vin" },
                  { title: "Stanford CS229: Machine Learning Supervised", url: "https://www.youtube.com/watch?v=jGwO_UgTS7I" },
                ].map((sample) => (
                  <button
                    key={sample.url}
                    type="button"
                    onClick={() => {
                      setUrlInput(sample.url);
                      handleOpenYouTubeUrl(sample.url);
                    }}
                    className="w-full text-left p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-xs font-semibold text-slate-200 border border-white/[0.06] flex items-center justify-between"
                  >
                    <span>{sample.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#9B99B5]" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleOpenYouTubeUrl()}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md"
              >
                Open Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
