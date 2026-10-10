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

  const handleOpenYouTubeUrl = async (urlToParse?: string) => {
    const targetUrl = urlToParse || urlInput;
    const extractedId = extractYouTubeVideoId(targetUrl);
    if (!extractedId) {
      alert("Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=... or https://www.youtube.com/live/...)");
      return;
    }

    let existing = getWorkspaceByVideoId(extractedId);
    if (existing && extractedId === "Y6FqkbuJGsY" && (existing.title.includes("Definite Integration") || existing.subjectName?.includes("Math"))) {
      existing = MOCK_LECTURE_DEMO;
      saveWorkspace(MOCK_LECTURE_DEMO);
    }

    if (existing) {
      setWorkspace(existing);
      setCurrentTimestampSec(existing.lastWatchedTimestampSec);
      setUrlInput("");
      setIsUrlModalOpen(false);
      return;
    }

    // Attempt oEmbed Title Fetching
    let fetchedTitle = "";
    try {
      const oembedRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${extractedId}`);
      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        if (oembedData.title) {
          fetchedTitle = oembedData.title;
        }
      }
    } catch (e) {
      console.warn("oEmbed fetch warning:", e);
    }

    const lowerTitle = (fetchedTitle + " " + targetUrl).toLowerCase();

    const isOrganicChem =
      extractedId === "VW_rTXij6TY" ||
      lowerTitle.includes("organic") ||
      lowerTitle.includes("conversion") ||
      lowerTitle.includes("halogen") ||
      lowerTitle.includes("alcohol") ||
      lowerTitle.includes("phenol") ||
      lowerTitle.includes("ether") ||
      lowerTitle.includes("aldehyde");

    const isCoordinationChem =
      extractedId === "Y6FqkbuJGsY" ||
      extractedId === "CoordinationCompounds2025" ||
      lowerTitle.includes("coordination") ||
      lowerTitle.includes("inorganic");

    const isIntegrationVideo =
      extractedId === "DefiniteIntegration2025" ||
      lowerTitle.includes("integration") ||
      lowerTitle.includes("calculus");

    const computedTitle =
      fetchedTitle ||
      (isOrganicChem
        ? "Organic Conversions Class 12 Part 1 HSC | Chemistry"
        : isCoordinationChem
        ? "Coordination Compounds Class 12 Chemistry | Full Chapter PYQs & Concepts"
        : isIntegrationVideo
        ? "Definite Integration MHT-CET 2025 PYQs | All Questions Solved"
        : `YouTube AI Lecture (${extractedId})`);

    const computedSubject = isOrganicChem
      ? "Organic Chemistry & Reactions"
      : isCoordinationChem
      ? "Inorganic & Coordination Chemistry"
      : isIntegrationVideo
      ? "Mathematics & Calculus"
      : "Chemistry & Sciences";

    const computedTopic = isOrganicChem
      ? "Organic Conversions, Halogen Derivatives, Alcohols & Phenols"
      : isCoordinationChem
      ? "Coordination Compounds, CFT & Ligands"
      : isIntegrationVideo
      ? "Definite Integration PYQs & Shortcut Tricks"
      : "Lecture Video Workspace";

    const computedUnit = isOrganicChem
      ? "Unit 4 · Organic Reactions & Functional Groups"
      : isCoordinationChem
      ? "Unit 5 · Inorganic & Coordination Chemistry"
      : isIntegrationVideo
      ? "Unit 2 · Integral Calculus & Applications"
      : "Unit 1 · Video Analysis";

    const newWorkspace: LectureWorkspaceData = {
      id: `lec-${extractedId}`,
      youtubeUrl: targetUrl,
      videoId: extractedId,
      title: computedTitle,
      thumbnailUrl: `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`,
      durationSec: isOrganicChem ? 9132 : isCoordinationChem || isIntegrationVideo ? 4705 : 3600,
      lastWatchedTimestampSec: 0,
      completionPercent: 0,
      subjectName: computedSubject,
      topicTitle: computedTopic,
      unitTitle: computedUnit,
      bookmarks: isOrganicChem
        ? [
            {
              id: "bm-org-1",
              timestampSec: 127,
              timestampFormatted: "02:07",
              title: "Halogen Derivatives & Alkyl Halides Conversions",
              type: "Important",
              description: "Preparation of alkyl halides from alcohols using PCl5, SOCl2 (Darzen process).",
              createdAt: "Today",
            },
            {
              id: "bm-org-2",
              timestampSec: 865,
              timestampFormatted: "14:25",
              title: "Alcohols, Phenols & Ethers Reaction Mechanisms",
              type: "Trick",
              description: "Williamson ether synthesis: R-ONa + R'-X -> R-O-R' + NaX.",
              createdAt: "Today",
            },
            {
              id: "bm-org-3",
              timestampSec: 2530,
              timestampFormatted: "42:10",
              title: "Aldehydes, Ketones & Carboxylic Acids Oxidation",
              type: "PYQ",
              description: "KMnO4 / K2Cr2O7 oxidation of primary alcohols to aldehydes and carboxylic acids.",
              createdAt: "Today",
            },
          ]
        : isCoordinationChem
        ? [
            {
              id: "bm-1",
              timestampSec: 240,
              timestampFormatted: "04:00",
              title: "Werner's Coordination Theory & Primary/Secondary Valency",
              type: "Important",
              description: "Primary valency = ionizable oxidation state; Secondary valency = coordination number.",
              createdAt: "Today",
            },
            {
              id: "bm-2",
              timestampSec: 865,
              timestampFormatted: "14:25",
              title: "Ligands & Denticity: Monodentate, Bidentate (en), EDTA",
              type: "Trick",
              description: "Chelating ligands like EDTA4- form stable 5- and 6-membered chelate rings.",
              createdAt: "Today",
            },
          ]
        : [],
      notes: isOrganicChem
        ? [
            {
              id: "note-org-1",
              timestampSec: 127,
              title: "Organic Conversions Summary",
              content:
                "📌 **Organic Chemistry Conversions Summary at [02:07]**:\n\n" +
                "1. **Halogen Derivatives:** Hydrohalogenation ($HX$ addition) follows Markovnikov's Rule (peroxide effect for $HBr$). Preparation of alkyl halides via $PCl_5, SOCl_2$ (Darzen process).\n" +
                "2. **Nucleophilic Substitution:** $S_N1$ occurs via carbocation intermediate ($3^\\circ > 2^\\circ > 1^\\circ$), while $S_N2$ proceeds via $100\\%$ Walden inversion ($1^\\circ > 2^\\circ > 3^\\circ$).\n" +
                "3. **Alcohols & Phenols:** Reimer-Tiemann reaction converts Phenol $\\to$ Salicylaldehyde using $CHCl_3 + KOH$.\n" +
                "4. **Aldehydes & Ketones:** Aldol condensation for $\\alpha$-hydrogen aldehydes vs Cannizzaro reaction for non-$\\alpha$-hydrogen aldehydes.",
              type: "summary",
              createdAt: "Today",
            },
          ]
        : isCoordinationChem
        ? [
            {
              id: "note-1",
              timestampSec: 0,
              title: "SUMMARY Notes",
              content:
                "📌 **Coordination Compounds Lecture Summary at [00:00]**:\n\n" +
                "1. **Werner's Coordination Theory:** Primary Valency = Ionizable (Oxidation State), Secondary Valency = Non-Ionizable (Coordination Number).\n" +
                "2. **Ligands & Denticity:** Monodentate ($NH_3, H_2O, Cl^-$), Bidentate ($en, C_2O_4^{2-}$), and Polydentate Chelating ligands ($EDTA^{4-}$ forming 6-ring complexes).\n" +
                "3. **Crystal Field Theory (CFT) Splitting:** Octahedral field splits 5 d-orbitals into lower $t_{2g}$ and higher $e_g$ with $\\Delta_o$. Strong field ligands ($CN^-, CO$) cause electron pairing & low-spin complexes.\n" +
                "4. **Effective Atomic Number (EAN):** $EAN = Z - \\text{Oxidation State} + 2 \\times \\text{Coordination Number}$. If $EAN = 36, 54, 86$, complex is extra stable!",
              type: "summary",
              createdAt: "Today",
            },
          ]
        : [],
      chatHistory: [
        {
          role: "assistant",
          content: `Hello! I am your AI Lecture Tutor for "${computedTitle}". Ask me any doubt about organic conversions, reaction mechanisms, SN1/SN2, or exam PYQs!`,
        },
      ],
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
                  { title: "Coordination Compounds Chemistry PYQs (1.3h Live)", url: "https://www.youtube.com/live/Y6FqkbuJGsY?si=X4Nyk2OJTWGsGAFq" },
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
