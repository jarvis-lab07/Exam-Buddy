import { Subject } from "@/types";
import { MOCK_SUBJECTS } from "@/lib/mock-data";

const STORAGE_KEY = "exam_buddy_user_subjects";
const CUSTOM_ONLY_KEY = "exam_buddy_custom_syllabus_only";

export const DEFAULT_VIVA_COLORS = [
  "#6366F1", // Indigo
  "#06B6D4", // Cyan
  "#8B5CF6", // Violet
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#F43F5E", // Rose
  "#3B82F6", // Blue
  "#14B8A6", // Teal
];

/**
 * Checks if the user is in custom syllabus mode (ignoring hardcoded presets).
 */
export function isCustomSyllabusOnly(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const val = localStorage.getItem(CUSTOM_ONLY_KEY);
    return val === "true";
  } catch {
    return false;
  }
}

/**
 * Sets whether the user only wants their custom syllabus.
 */
export function setCustomSyllabusOnly(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CUSTOM_ONLY_KEY, enabled ? "true" : "false");
    window.dispatchEvent(new Event("exam_buddy_subjects_updated"));
  } catch (e) {
    console.error("Failed to set custom syllabus mode:", e);
  }
}

/**
 * Gets all user subjects. If custom syllabus only is true, returns only user-defined subjects.
 * If user has saved subjects, returns them; otherwise returns MOCK_SUBJECTS as fallback.
 */
export function getUserSubjects(): Subject[] {
  if (typeof window === "undefined") return MOCK_SUBJECTS;

  try {
    const customOnly = isCustomSyllabusOnly();
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed: Subject[] = JSON.parse(stored);
      if (parsed.length > 0) return parsed;
      if (customOnly) return [];
    }

    if (customOnly) {
      return [];
    }

    return MOCK_SUBJECTS;
  } catch (e) {
    console.error("Error loading user subjects:", e);
    return MOCK_SUBJECTS;
  }
}

/**
 * Saves subjects to local storage and notifies subscribers.
 */
export function saveUserSubjects(subjects: Subject[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
    window.dispatchEvent(new Event("exam_buddy_subjects_updated"));
  } catch (e) {
    console.error("Failed to save subjects:", e);
  }
}

/**
 * Adds a new custom subject.
 */
export function addUserSubject(newSubjectData: {
  name: string;
  code?: string;
  color?: string;
  degree?: Subject["degree"];
  semesterOrYear?: string;
}): Subject {
  const current = getUserSubjects();
  const color = newSubjectData.color || DEFAULT_VIVA_COLORS[current.length % DEFAULT_VIVA_COLORS.length];
  const code = newSubjectData.code?.trim() || newSubjectData.name.slice(0, 4).toUpperCase() + (100 + current.length);
  const id = `subj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const newSubject: Subject = {
    id,
    name: newSubjectData.name.trim(),
    title: newSubjectData.name.trim(),
    code,
    degree: newSubjectData.degree || "Engineering",
    semesterOrYear: newSubjectData.semesterOrYear || "Current Semester",
    color,
    accentColor: color,
    examDate: "Saturday (Mock Interview)",
    units: [
      {
        id: `${id}-u1`,
        unitNumber: 1,
        title: "Mock Interview Shortlist Questions",
        topics: ["Shortlisted Viva Questions 1-10"],
        status: "in_progress",
        progressPercentage: 0,
        notesCount: 1,
        flashcardsCount: 10,
      },
    ],
  };

  const updated = [...current, newSubject];
  saveUserSubjects(updated);
  setCustomSyllabusOnly(true);
  return newSubject;
}

/**
 * Deletes a subject by ID.
 */
export function deleteUserSubject(subjectId: string): Subject[] {
  const current = getUserSubjects();
  const updated = current.filter((s) => s.id !== subjectId);
  saveUserSubjects(updated);
  return updated;
}

/**
 * Configures the user's exact 5 subjects for Mock Interview in one click.
 * This completely wipes any unwanted presets and sets ONLY these 5 subjects.
 */
export function configureMy5Subjects(subjectNames: string[]): Subject[] {
  const newSubjects: Subject[] = subjectNames
    .filter((n) => n.trim().length > 0)
    .map((name, idx) => {
      const color = DEFAULT_VIVA_COLORS[idx % DEFAULT_VIVA_COLORS.length];
      const code = name.replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase() || `SUB${idx + 1}`;
      const id = `mi-subj-${idx + 1}-${Date.now()}`;

      return {
        id,
        name: name.trim(),
        title: name.trim(),
        code,
        degree: "Engineering",
        semesterOrYear: "Mock Interview 2026",
        color,
        accentColor: color,
        examDate: "Saturday (Mock Interview)",
        units: [
          {
            id: `${id}-u1`,
            unitNumber: 1,
            title: "Shortlisted Viva Questions",
            topics: ["10 Expected Viva Questions"],
            status: "in_progress",
            progressPercentage: 0,
            notesCount: 1,
            flashcardsCount: 10,
          },
        ],
      };
    });

  saveUserSubjects(newSubjects);
  setCustomSyllabusOnly(true);
  return newSubjects;
}
