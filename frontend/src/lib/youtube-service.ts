export interface TimestampBookmark {
  id: string;
  timestampSec: number;
  timestampFormatted: string; // e.g. "14:25"
  title: string;
  type: "Important" | "Formula" | "Definition" | "Doubt" | "Example" | "Trick" | "PYQ" | "Revision";
  description?: string;
  createdAt: string;
}

export interface LectureNote {
  id: string;
  timestampSec?: number;
  title: string;
  content: string;
  type: "summary" | "detailed" | "exam" | "formula" | "custom";
  createdAt: string;
}

export interface LectureWorkspaceData {
  id: string; // Video ID or unique workspace ID
  youtubeUrl: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  durationSec: number;
  lastWatchedTimestampSec: number;
  completionPercent: number;
  subjectName?: string;
  topicTitle?: string;
  unitTitle?: string;
  bookmarks: TimestampBookmark[];
  notes: LectureNote[];
  chatHistory: { role: "user" | "assistant"; content: string; timestampSec?: number }[];
  updatedAt: string;
}

export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Plain video ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Standard youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // Short link youtu.be/VIDEO_ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // Embed link youtube.com/embed/VIDEO_ID
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  return null;
}

export function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const STORAGE_KEY_WORKSPACES = "exam_buddy_lecture_workspaces";

export function getStoredWorkspaces(): LectureWorkspaceData[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY_WORKSPACES);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load lecture workspaces:", e);
  }
  return [];
}

export function saveWorkspace(data: LectureWorkspaceData): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredWorkspaces();
    const existingIdx = current.findIndex((w) => w.videoId === data.videoId);
    const updated = [...current];
    if (existingIdx >= 0) {
      updated[existingIdx] = { ...data, updatedAt: new Date().toISOString() };
    } else {
      updated.unshift({ ...data, updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save lecture workspace:", e);
  }
}

export function getWorkspaceByVideoId(videoId: string): LectureWorkspaceData | null {
  const workspaces = getStoredWorkspaces();
  return workspaces.find((w) => w.videoId === videoId) || null;
}

export const MOCK_LECTURE_DEMO: LectureWorkspaceData = {
  id: "demo-lecture-1",
  youtubeUrl: "https://www.youtube.com/watch?v=8hly31xKli0",
  videoId: "8hly31xKli0", // Algorithms / Data Structures tutorial video
  title: "Data Structures & Algorithms: Complete Course for University Midterms",
  thumbnailUrl: "https://img.youtube.com/vi/8hly31xKli0/hqdefault.jpg",
  durationSec: 3600,
  lastWatchedTimestampSec: 865,
  completionPercent: 24,
  subjectName: "Data Structures & Algorithms",
  topicTitle: "AVL Trees & Single/Double Rotations",
  unitTitle: "Unit 4: Trees & Balanced Search Structures",
  bookmarks: [
    {
      id: "bm-1",
      timestampSec: 240,
      timestampFormatted: "04:00",
      title: "Binary Search Tree Invariance Lemma",
      type: "Important",
      description: "Left subtree keys < Root key < Right subtree keys.",
      createdAt: "Today",
    },
    {
      id: "bm-2",
      timestampSec: 865,
      timestampFormatted: "14:25",
      title: "AVL Balance Factor Calculation: Height(Left) - Height(Right)",
      type: "Formula",
      description: "Valid balance factors are only {-1, 0, +1}.",
      createdAt: "Today",
    },
    {
      id: "bm-3",
      timestampSec: 1450,
      timestampFormatted: "24:10",
      title: "Double Rotation (LR / RL) Edge Case in Midterms",
      type: "Trick",
      description: "Perform child rotation first before main root rotation.",
      createdAt: "Today",
    },
  ],
  notes: [
    {
      id: "note-1",
      timestampSec: 865,
      title: "AVL Tree Balance Factor Proof",
      content:
        "An AVL tree guarantees O(log N) search time by maintaining strict height balance. If Balance Factor exceeds +1 or -1, a single or double rotation restores height equilibrium immediately.",
      type: "summary",
      createdAt: "Today",
    },
  ],
  chatHistory: [
    {
      role: "assistant",
      content:
        "Hello! I am your AI Lecture Tutor for this Data Structures & Algorithms lecture. Ask me any question, ask for Hindi explanations, or generate quizzes from this video!",
    },
  ],
  updatedAt: new Date().toISOString(),
};
