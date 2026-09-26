export type DegreeType =
  | "All"
  | "Engineering"
  | "Medicine"
  | "Law"
  | "Commerce"
  | "Management"
  | "Sciences"
  | "Other";

export type UnitStatus = "mastered" | "in_progress" | "not_started";

export interface Unit {
  id: string;
  unitNumber: number;
  title: string;
  topics: string[];
  status: UnitStatus;
  progressPercentage: number;
  notesCount: number;
  flashcardsCount: number;
  description?: string;
  estimatedHours?: number;
  subjectId?: string;
  topicsCount?: number;
  masteredTopicsCount?: number;
  isCompleted?: boolean;
  isCurrent?: boolean;
}

export interface Subject {
  id: string;
  name: string;
  title?: string;
  code: string;
  degree: "Engineering" | "Medicine" | "Law" | "Commerce" | "Management" | "Sciences" | "Other";
  semesterOrYear: string;
  color: string;
  accentColor: string;
  bgGradient?: string;
  category?: string;
  examDate: string;
  nextExamDate?: string;
  units: Unit[];
  totalUnits?: number;
  completedUnits?: number;
  totalTopics?: number;
  masteredTopics?: number;
  currentUnit?: {
    unitNumber: number;
    title: string;
    progressPercentage: number;
  };
  lastAccessed?: string;
}

export interface UserProfile {
  name: string;
  username: string;
  avatarUrl: string;
  college: string;
  branch: string;
  year: string;
  semester: string;
  activeCohort: string;
  streakDays: number;
  longestStreakDays: number;
  cloudStorageUsedGB: number;
  cloudStorageTotalGB: number;
  aiTokensUsed: number;
  aiTokensTotal: number;
}

export interface StudyStats {
  totalStudyHours: number;
  hoursTrendPercent: number;
  currentStreakDays: number;
  longestStreakDays: number;
  topicsMastered: number;
  totalTopics: number;
  quizAccuracyPercent: number;
  cohortPercentile: number;
}

export interface RecentDocument {
  id: string;
  title: string;
  subjectName: string;
  subjectCode: string;
  subjectColor: string;
  fileType: "pdf" | "ppt" | "doc" | "notes";
  fileSize: string;
  uploadDate: string;
  pages?: number;
  aiSummaryReady: boolean;
}

export interface StudyTask {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  topicTitle: string;
  type: "revision" | "quiz" | "flashcards" | "practice";
  dueText: string;
  isHighPriority: boolean;
  completed: boolean;
}

export interface WeeklyStudyDay {
  day: string;
  fullDay: string;
  minutes: number;
  targetMinutes: number;
  isToday: boolean;
}

export interface QuickMetric {
  id: string;
  label: string;
  value: string;
  trendText: string;
  trendType: "positive" | "neutral" | "badge";
  badgeText?: string;
  accent: "indigo" | "violet" | "cyan" | "emerald" | "amber";
}

export type FlashcardDifficulty = "easy" | "medium" | "hard";
export type FlashcardDeckType = "high-yield" | "mistake-notebook" | "formulas" | "standard";
export type FlashcardMastery = "new" | "learning" | "mastered";

export interface Flashcard {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  subjectColor: string;
  unitNumber?: number;
  unitTitle?: string;
  question: string;
  answer: string;
  formula?: string;
  codeSnippet?: string;
  examTip?: string;
  hint?: string;
  difficulty: FlashcardDifficulty;
  deckType: FlashcardDeckType;
  masteryStatus: FlashcardMastery;
  reviewIntervalDays?: number;
  lastReviewed?: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subjectId: string;
  subjectCode: string;
  color: string;
  cardCount: number;
  masteredCount: number;
  tag: string;
  description: string;
}

export type DocumentCategory =
  | "Lecture Notes"
  | "Syllabus / PPT"
  | "Question Bank / PYQ"
  | "Cheat Sheet"
  | "Lab Manual";

export type DocumentStatus = "vectorized" | "processing" | "indexing" | "ready";

export interface DocumentUploadItem {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  subjectColor: string;
  unitTitle?: string;
  fileType: "pdf" | "ppt" | "doc" | "notes";
  fileSize: string;
  category: DocumentCategory;
  status: DocumentStatus;
  uploadDate: string;
  pages: number;
  vectorCount: number;
  summary: string;
  keyTopics: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  dayOfWeek: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  timeSlot: string; // e.g. "09:00 - 10:30"
  durationMinutes: number;
  type: "revision" | "lecture" | "quiz" | "flashcards" | "exam";
  roomOrPlatform?: string;
  unitTitle?: string;
}

export type PomodoroMode = "focus" | "shortBreak" | "longBreak";

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  roundsUntilLongBreak: number;
  autoAdvance: boolean;
}

export interface PomodoroSession {
  mode: PomodoroMode;
  isRunning: boolean;
  timeLeftSeconds: number;
  completedRounds: number;
  todayTotalFocusMinutes: number;
  settings: PomodoroSettings;
  dateKey: string;
}

