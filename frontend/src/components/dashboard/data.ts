import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bot,
  BookOpen,
  Calculator,
  Calendar,
  CalendarDays,
  ClipboardList,
  Code2,
  Dna,
  FileText,
  FlaskConical,
  FolderOpen,
  Landmark,
  Languages,
  Layers,
  LayoutDashboard,
  Settings,
} from "lucide-react";

/* ---------- Navigation ---------- */
export type NavItem = {
  label: string;
  icon: LucideIcon;
  badge?: number;
  active?: boolean;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "AI Assistant", icon: Bot, badge: 3 },
  { label: "Subjects", icon: BookOpen },
  { label: "Study Planner", icon: ClipboardList },
  { label: "Flashcards", icon: Layers },
  { label: "Notes", icon: FileText },
  { label: "Mock Tests", icon: ClipboardList },
  { label: "PDF Library", icon: FolderOpen },
  { label: "Analytics", icon: BarChart3 },
  { label: "Calendar", icon: CalendarDays },
  { label: "Settings", icon: Settings },
];

/* ---------- Subjects ---------- */
export type Subject = {
  name: string;
  icon: LucideIcon;
  progress: number;
  chapter: string;
  color: string; // tailwind text color token via inline style
  accent: string; // hex for subtle backgrounds
};

export const subjects: Subject[] = [
  {
    name: "Mathematics",
    icon: Calculator,
    progress: 78,
    chapter: "Ch. 7 · Integral Calculus",
    color: "#4f8cff",
    accent: "#4f8cff",
  },
  {
    name: "Biology",
    icon: Dna,
    progress: 64,
    chapter: "Ch. 4 · Genetics",
    color: "#38d6c4",
    accent: "#38d6c4",
  },
  {
    name: "Physics",
    icon: FlaskConical,
    progress: 52,
    chapter: "Ch. 9 · Electromagnetism",
    color: "#f5a524",
    accent: "#f5a524",
  },
  {
    name: "History",
    icon: Landmark,
    progress: 88,
    chapter: "Unit 5 · Cold War",
    color: "#e5757d",
    accent: "#e5757d",
  },
  {
    name: "Computer Science",
    icon: Code2,
    progress: 71,
    chapter: "Module 3 · Data Structures",
    color: "#8b7cf6",
    accent: "#8b7cf6",
  },
  {
    name: "Economics",
    icon: BarChart3,
    progress: 45,
    chapter: "Ch. 2 · Microeconomics",
    color: "#4ade80",
    accent: "#4ade80",
  },
  {
    name: "Languages",
    icon: Languages,
    progress: 60,
    chapter: "Spanish · B1 Grammar",
    color: "#38bdf8",
    accent: "#38bdf8",
  },
];

/* ---------- Quick actions ---------- */
export type QuickAction = {
  label: string;
  description: string;
  icon: LucideIcon;
};

/* ---------- Continue learning ---------- */
export type ContinueItem = {
  subject: string;
  title: string;
  icon: LucideIcon;
  progress: number;
  minutesLeft: number;
  accent: string;
};

export const continueLearning: ContinueItem[] = [
  {
    subject: "Mathematics",
    title: "Definite Integrals & Area Under Curves",
    icon: Calculator,
    progress: 62,
    minutesLeft: 18,
    accent: "#4f8cff",
  },
  {
    subject: "Computer Science",
    title: "Balanced Binary Search Trees",
    icon: Code2,
    progress: 40,
    minutesLeft: 25,
    accent: "#8b7cf6",
  },
  {
    subject: "Biology",
    title: "Mendelian Inheritance Patterns",
    icon: Dna,
    progress: 85,
    minutesLeft: 8,
    accent: "#38d6c4",
  },
];

/* ---------- Study planner tasks ---------- */
export type PlannerTask = {
  title: string;
  subject: string;
  time: string;
  done: boolean;
  accent: string;
};

export const plannerTasks: PlannerTask[] = [
  {
    title: "Revise integration by parts",
    subject: "Mathematics",
    time: "09:00",
    done: true,
    accent: "#4f8cff",
  },
  {
    title: "Genetics flashcards (25 cards)",
    subject: "Biology",
    time: "11:30",
    done: true,
    accent: "#38d6c4",
  },
  {
    title: "Physics mock test — Section B",
    subject: "Physics",
    time: "14:00",
    done: false,
    accent: "#f5a524",
  },
  {
    title: "Summarize Cold War timeline",
    subject: "History",
    time: "16:30",
    done: false,
    accent: "#e5757d",
  },
  {
    title: "Spanish speaking practice",
    subject: "Languages",
    time: "18:00",
    done: false,
    accent: "#38bdf8",
  },
];

/* ---------- Calendar exams ---------- */
export type ExamDay = {
  day: number;
  label: string;
  subject: string;
  accent: string;
};

export const examDays: ExamDay[] = [
  { day: 12, label: "Math Midterm", subject: "Mathematics", accent: "#4f8cff" },
  { day: 18, label: "Biology Quiz", subject: "Biology", accent: "#38d6c4" },
  { day: 24, label: "Physics Final", subject: "Physics", accent: "#f5a524" },
];

/* ---------- Analytics ---------- */
export const weeklyStudy = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 3.2 },
  { day: "Wed", hours: 1.8 },
  { day: "Thu", hours: 4.1 },
  { day: "Fri", hours: 3.6 },
  { day: "Sat", hours: 5.2 },
  { day: "Sun", hours: 2.9 },
];

export const masteryBreakdown = [
  { label: "Mastered", value: 42, accent: "#38d6c4" },
  { label: "In progress", value: 33, accent: "#4f8cff" },
  { label: "Needs review", value: 25, accent: "#f5a524" },
];

/* ---------- Uploaded materials ---------- */
export type Material = {
  name: string;
  subject: string;
  size: string;
  pages: number;
  status: "Analyzed" | "Processing";
  accent: string;
};

export const materials: Material[] = [
  {
    name: "Calculus_Notes_Unit7.pdf",
    subject: "Mathematics",
    size: "4.2 MB",
    pages: 38,
    status: "Analyzed",
    accent: "#4f8cff",
  },
  {
    name: "Genetics_Lecture_Slides.pdf",
    subject: "Biology",
    size: "8.1 MB",
    pages: 64,
    status: "Analyzed",
    accent: "#38d6c4",
  },
  {
    name: "Electromagnetism_Problems.pdf",
    subject: "Physics",
    size: "2.7 MB",
    pages: 21,
    status: "Processing",
    accent: "#f5a524",
  },
  {
    name: "ColdWar_Timeline.pdf",
    subject: "History",
    size: "1.9 MB",
    pages: 15,
    status: "Analyzed",
    accent: "#e5757d",
  },
];

/* ---------- Recent activity ---------- */
export type Activity = {
  action: string;
  detail: string;
  time: string;
  icon: LucideIcon;
  accent: string;
};

export const activities: Activity[] = [
  {
    action: "Completed mock test",
    detail: "Physics · scored 84%",
    time: "12m ago",
    icon: ClipboardList,
    accent: "#f5a524",
  },
  {
    action: "Generated 25 flashcards",
    detail: "Biology · Genetics",
    time: "1h ago",
    icon: Layers,
    accent: "#38d6c4",
  },
  {
    action: "Asked AI Assistant",
    detail: '"Explain eigenvalues simply"',
    time: "2h ago",
    icon: Bot,
    accent: "#8b7cf6",
  },
  {
    action: "Uploaded PDF",
    detail: "Calculus_Notes_Unit7.pdf",
    time: "5h ago",
    icon: FileText,
    accent: "#4f8cff",
  },
  {
    action: "Finished chapter",
    detail: "History · Cold War",
    time: "Yesterday",
    icon: BookOpen,
    accent: "#e5757d",
  },
];

export const monthDays = Array.from({ length: 30 }, (_, i) => i + 1);
export const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];
