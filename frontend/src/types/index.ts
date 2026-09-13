export interface Subject {
  id: string;
  name: string;
  code: string;
  category: string;
  accentColor: string;
  bgGradient: string;
  totalUnits: number;
  completedUnits: number;
  totalTopics: number;
  masteredTopics: number;
  currentUnit: {
    unitNumber: number;
    title: string;
    progressPercentage: number;
  };
  lastAccessed: string;
  nextExamDate?: string;
}

export interface Unit {
  id: string;
  subjectId: string;
  unitNumber: number;
  title: string;
  description: string;
  topicsCount: number;
  masteredTopicsCount: number;
  estimatedHours: number;
  isCompleted: boolean;
  isCurrent: boolean;
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
