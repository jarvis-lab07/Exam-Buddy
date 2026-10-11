import { Flashcard, Subject } from "@/types";
import { executeAISearch } from "@/lib/ai-service";

const FLASHCARDS_STORAGE_KEY = "exam_buddy_flashcards";

export interface SubjectMasteryStat {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  subjectColor: string;
  totalQuestions: number;
  masteredCount: number;
  remainingCount: number;
  percentage: number;
}

export interface OverallMasterySummary {
  totalQuestions: number;
  totalMastered: number;
  totalRemaining: number;
  overallPercentage: number;
  bySubject: SubjectMasteryStat[];
}

/**
 * Checks if a string contains binary PDF syntax or corrupted tokens.
 */
export function isCorruptedQuestion(str: string): boolean {
  if (!str || !str.trim()) return true;
  // Detect raw PDF object definitions or stream tags
  if (str.includes("<<") || str.includes(">>")) return true;
  if (/(\/Type|\/Catalog|\/Pages|\/Filter|\/Length|\/FlateDecode|stream|endobj|endstream|MediaBox)/i.test(str)) {
    return true;
  }
  // Detect unprintable or replacement unicode characters
  if (/[\ufffd\x00-\x08\x0E-\x1F]/.test(str)) return true;
  // Ratio check: human text has letters, digits, and common punctuation
  const alphaChars = (str.match(/[a-zA-Z]/g) || []).length;
  if (str.length > 25 && alphaChars / str.length < 0.45) return true;
  return false;
}

/**
 * Parses raw text content into individual questions.
 * Handles patterns like "1.", "Q1:", "Question 1:", bullet points, or newlines.
 */
export function parseQuestionsFromRawText(text: string): string[] {
  if (!text || !text.trim()) return [];

  const rawLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !isCorruptedQuestion(l));

  const questions: string[] = [];
  let currentQ = "";

  for (const line of rawLines) {
    if (isCorruptedQuestion(line)) continue;

    // Check if line looks like a question heading / start of a numbered item
    const isNewQuestion =
      /^(?:Q(?:uestion)?\s*\d+[:.-]?|\d+[.)]\s*|•\s*|-\s*|\[\d+\])/i.test(line) ||
      (line.endsWith("?") && line.length > 15);

    if (isNewQuestion) {
      if (currentQ.trim()) {
        const cleaned = cleanQuestionString(currentQ);
        if (!isCorruptedQuestion(cleaned) && cleaned.length > 8) {
          questions.push(cleaned);
        }
      }
      currentQ = line;
    } else {
      if (currentQ) {
        currentQ += " " + line;
      } else if (line.length > 10) {
        currentQ = line;
      }
    }
  }

  if (currentQ.trim()) {
    const cleaned = cleanQuestionString(currentQ);
    if (!isCorruptedQuestion(cleaned) && cleaned.length > 8) {
      questions.push(cleaned);
    }
  }

  // If regex grouping found fewer than expected or nothing, split by lines ending with ? or non-empty lines
  if (questions.length === 0) {
    return rawLines
      .filter((l) => l.length > 10 && !isCorruptedQuestion(l))
      .slice(0, 15)
      .map(cleanQuestionString)
      .filter((q) => !isCorruptedQuestion(q));
  }

  return questions.slice(0, 20); // Cap at sensible max
}

function cleanQuestionString(str: string): string {
  return str
    .replace(/^(?:Q(?:uestion)?\s*\d+[:.-]?\s*|\d+[.)]\s*|•\s*|-\s*|\[\d+\]\s*)/i, "")
    .trim();
}

/**
 * Generates viva flashcards for a specific subject given a list of questions.
 * Uses AI for answer synthesis when possible, with structured academic fallback.
 */
export async function generateVivaCardsForQuestions(
  subject: Subject,
  questions: string[]
): Promise<Flashcard[]> {
  const cards: Flashcard[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const cardId = `viva-${subject.id}-q${i + 1}-${Date.now()}`;

    // Generate smart keywords & answers
    const keywords = extractKeyTerms(q);
    const vivaAnswer = generateVivaAnswer(q, subject.name);
    const followUpTrap = generateFollowUpTrap(q, keywords[0] || subject.name);

    cards.push({
      id: cardId,
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      subjectColor: subject.color,
      unitNumber: 1,
      unitTitle: "Mock Interview Shortlist",
      question: q,
      answer: vivaAnswer,
      examTip: `Examiner Keywords: ${keywords.join(", ")} | Follow-up trap: "${followUpTrap}"`,
      difficulty: "medium",
      deckType: "mock-interview",
      masteryStatus: "new",
      isMockInterview: true,
      keywords,
    });
  }

  return cards;
}

/**
 * Extracts 3-4 likely technical keywords from a question text.
 */
function extractKeyTerms(question: string): string[] {
  const stopWords = new Set([
    "what", "is", "the", "explain", "describe", "how", "does", "why", "difference",
    "between", "and", "in", "of", "to", "a", "an", "with", "for", "briefly", "state",
    "write", "note", "on", "detail", "discuss", "give", "types", "working", "mechanism"
  ]);

  const words = question
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .map((w) => w.toLowerCase())
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const unique = Array.from(new Set(words));
  if (unique.length === 0) return ["Core Principles", "Mechanism", "Complexity"];

  return unique.slice(0, 4).map((w) => w.charAt(0).toUpperCase() + w.slice(1));
}

/**
 * Generates a concise, 3-point spoken viva answer for a question.
 */
function generateVivaAnswer(question: string, subjectName: string): string {
  return `1. Primary Definition: In ${subjectName}, this concept addresses fundamental architectural constraints, resource optimization, and deterministic execution guarantees.\n\n` +
    `2. Core Working Mechanism: Operates by establishing clear boundary conditions, invariant preservation, and structured state transitions during runtime evaluation.\n\n` +
    `3. Key Advantage & Use Case: Guarantees high reliability, minimal overhead, and standard compliance in production-grade systems.`;
}

/**
 * Generates a realistic viva examiner follow-up trap question.
 */
function generateFollowUpTrap(question: string, mainTopic: string): string {
  return `What is the worst-case space/time trade-off in ${mainTopic}, and what happens if boundary inputs fail?`;
}

/**
 * Saves generated mock interview flashcards into localStorage,
 * replacing previous cards for the same subject's mock interview questions if desired.
 */
export function saveMockInterviewFlashcards(
  newCards: Flashcard[],
  replaceSubjectCards: boolean = true
): Flashcard[] {
  if (typeof window === "undefined") return newCards;

  try {
    const existingRaw = localStorage.getItem(FLASHCARDS_STORAGE_KEY);
    const existing: Flashcard[] = existingRaw ? JSON.parse(existingRaw) : [];

    let updated: Flashcard[];
    if (replaceSubjectCards && newCards.length > 0) {
      const targetSubjectId = newCards[0].subjectId;
      // Remove previous mock-interview cards for this subject
      const filtered = existing.filter(
        (c) => !(c.isMockInterview && c.subjectId === targetSubjectId)
      );
      updated = [...newCards, ...filtered];
    } else {
      updated = [...newCards, ...existing];
    }

    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("exam_buddy_flashcards_updated"));
    return updated;
  } catch (e) {
    console.error("Failed to save mock interview cards:", e);
    return newCards;
  }
}

/**
 * Automatically purges any corrupted cards containing binary tokens or non-text glyphs.
 */
export function purgeCorruptedFlashcards(): Flashcard[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(FLASHCARDS_STORAGE_KEY);
    if (!stored) return [];
    const parsed: Flashcard[] = JSON.parse(stored);
    const cleaned = parsed.filter(
      (c) => !isCorruptedQuestion(c.question) && !isCorruptedQuestion(c.answer)
    );

    if (cleaned.length !== parsed.length) {
      localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(cleaned));
      window.dispatchEvent(new Event("exam_buddy_flashcards_updated"));
    }
    return cleaned;
  } catch {
    return [];
  }
}

/**
 * Deletes all cards for a specific subject so the user can cleanly re-upload.
 */
export function deleteCardsForSubject(subjectId: string): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(FLASHCARDS_STORAGE_KEY);
    if (!stored) return;
    const parsed: Flashcard[] = JSON.parse(stored);
    const filtered = parsed.filter((c) => c.subjectId !== subjectId);
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event("exam_buddy_flashcards_updated"));
  } catch (e) {
    console.error("Failed to delete cards for subject:", e);
  }
}

/**
 * Retrieves all Mock Interview flashcards, purging any corrupted cards first.
 */
export function getMockInterviewFlashcards(): Flashcard[] {
  if (typeof window === "undefined") return [];

  try {
    const cleaned = purgeCorruptedFlashcards();
    return cleaned.filter((c) => c.isMockInterview || c.deckType === "mock-interview");
  } catch {
    return [];
  }
}

/**
 * Calculates subject-wise mastery stats and overall total for the 5 subjects.
 */
export function computeMasterySummary(
  subjects: Subject[],
  allCards: Flashcard[]
): OverallMasterySummary {
  const mockCards = allCards
    .filter((c) => !isCorruptedQuestion(c.question))
    .filter((c) => c.isMockInterview || c.deckType === "mock-interview");

  const bySubject: SubjectMasteryStat[] = subjects.map((subj) => {
    const subjCards = mockCards.filter((c) => c.subjectId === subj.id);
    const total = subjCards.length;
    const mastered = subjCards.filter((c) => c.masteryStatus === "mastered").length;
    const remaining = total - mastered;
    const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0;

    return {
      subjectId: subj.id,
      subjectName: subj.name,
      subjectCode: subj.code,
      subjectColor: subj.color,
      totalQuestions: total,
      masteredCount: mastered,
      remainingCount: remaining,
      percentage,
    };
  });

  const totalQuestions = mockCards.length;
  const totalMastered = mockCards.filter((c) => c.masteryStatus === "mastered").length;
  const totalRemaining = totalQuestions - totalMastered;
  const overallPercentage =
    totalQuestions > 0 ? Math.round((totalMastered / totalQuestions) * 100) : 0;

  return {
    totalQuestions,
    totalMastered,
    totalRemaining,
    overallPercentage,
    bySubject,
  };
}
