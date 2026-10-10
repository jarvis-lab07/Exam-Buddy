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

  // Live stream URL: youtube.com/live/VIDEO_ID
  const liveMatch = trimmed.match(/(?:youtube\.com|youtube-nocookie\.com)\/live\/([a-zA-Z0-9_-]{11})/i);
  if (liveMatch) return liveMatch[1];

  // Standard watch URL: youtube.com/watch?v=VIDEO_ID or watch?param=value&v=VIDEO_ID
  const watchMatch = trimmed.match(/(?:youtube\.com|youtube-nocookie\.com)\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/i);
  if (watchMatch) return watchMatch[1];

  // Short link: youtu.be/VIDEO_ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (shortMatch) return shortMatch[1];

  // Embed link: youtube.com/embed/VIDEO_ID
  const embedMatch = trimmed.match(/(?:youtube\.com|youtube-nocookie\.com)\/embed\/([a-zA-Z0-9_-]{11})/i);
  if (embedMatch) return embedMatch[1];

  // Shorts link: youtube.com/shorts/VIDEO_ID
  const shortsMatch = trimmed.match(/(?:youtube\.com|youtube-nocookie\.com)\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch) return shortsMatch[1];

  // Direct v link: youtube.com/v/VIDEO_ID
  const vMatch = trimmed.match(/(?:youtube\.com|youtube-nocookie\.com)\/v\/([a-zA-Z0-9_-]{11})/i);
  if (vMatch) return vMatch[1];

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
    if (stored) {
      let list: LectureWorkspaceData[] = JSON.parse(stored);
      let migrated = false;
      list = list.map((w) => {
        if (
          (w.videoId === "Y6FqkbuJGsY" || w.videoId === "DefiniteIntegration2025") &&
          (w.title.includes("Definite Integration") || w.subjectName?.includes("Math"))
        ) {
          migrated = true;
          return { ...MOCK_LECTURE_DEMO };
        }
        return w;
      });
      if (migrated) {
        localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(list));
      }
      return list;
    }
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
  const found = workspaces.find((w) => w.videoId === videoId);
  if (found) {
    if (
      (videoId === "Y6FqkbuJGsY" || videoId === "DefiniteIntegration2025") &&
      (found.title.includes("Definite Integration") || found.subjectName?.includes("Math"))
    ) {
      return MOCK_LECTURE_DEMO;
    }
    return found;
  }
  if (videoId === "Y6FqkbuJGsY" || videoId === "DefiniteIntegration2025") {
    return MOCK_LECTURE_DEMO;
  }
  return null;
}

export const MOCK_LECTURE_DEMO: LectureWorkspaceData = {
  id: "demo-lecture-coordination-compounds",
  youtubeUrl: "https://www.youtube.com/live/Y6FqkbuJGsY?si=X4Nyk2OJTWGsGAFq",
  videoId: "Y6FqkbuJGsY",
  title: "Coordination Compounds Class 12 Chemistry | Optical Isomerism & CFT",
  thumbnailUrl: "https://img.youtube.com/vi/Y6FqkbuJGsY/hqdefault.jpg",
  durationSec: 4705, // 1 hour 18 mins 25 secs (1.3 hrs)
  lastWatchedTimestampSec: 865, // 14:25
  completionPercent: 32,
  subjectName: "Chemistry & Inorganic Chemistry",
  topicTitle: "Coordination Compounds, Isomerism & CFT",
  unitTitle: "Unit 5 · Inorganic & Coordination Chemistry",
  bookmarks: [
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
      title: "Optical Isomers in Octahedral Complexes [Co(en)3]3+",
      type: "Trick",
      description: "Homoleptic [Co(en)3]3+ lacks symmetry plane, forming non-superimposable d and l enantiomers.",
      createdAt: "Today",
    },
    {
      id: "bm-3",
      timestampSec: 2530,
      timestampFormatted: "42:10",
      title: "Crystal Field Theory (CFT) & Spectrochemical Series",
      type: "PYQ",
      description: "Strong field ligands (CN-, CO, en) split d-orbitals into t2g and eg with low-spin pairing.",
      createdAt: "Today",
    },
  ],
  notes: [
    {
      id: "note-1",
      timestampSec: 865,
      title: "SUMMARY Notes",
      content:
        "📌 **Coordination Compounds Summary at [14:25]**:\n\n" +
        "1. **Homoleptic vs Heteroleptic Complexes:** $[Co(en)_3]^{3+}$ is a homoleptic bidentate complex.\n" +
        "2. **Optical Activity:** $[Co(en)_3]^{3+}$ lacks a plane of symmetry ($\\sigma$), forming non-superimposable $d$- and $l$-enantiomer mirror images.\n" +
        "3. **Crystal Field Theory (CFT) Splitting:** Octahedral field splits 5 d-orbitals into lower $t_{2g}$ and higher $e_g$ with $\\Delta_o$. Strong field ligands ($en, CN^-, CO$) cause low-spin pairing.\n" +
        "4. **Effective Atomic Number (EAN):** $EAN = Z - \\text{Oxidation State} + 2 \\times \\text{Coordination Number} = 27 - 3 + 2(6) = 36$ (Stable Krypton configuration!).",
      type: "summary",
      createdAt: "Today",
    },
  ],
  chatHistory: [
    {
      role: "assistant",
      content:
        "Hello! I am your AI Lecture Tutor for 'Coordination Compounds Class 12 Chemistry'. Ask me any doubt about ligands, optical isomerism in [Co(en)3]3+, CFT splitting, or 5-mark exam questions!",
    },
  ],
  updatedAt: new Date().toISOString(),
};
