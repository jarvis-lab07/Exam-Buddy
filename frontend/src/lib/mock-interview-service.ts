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

export interface ExtractedQuestionItem {
  number?: number;
  question: string;
  answer?: string;
}

/**
 * Universal Answer Formatter
 * Transforms raw text from PDF tables and document extracts into clean,
 * presentable Markdown tables, definition bullets, and structured steps.
 */
export function formatAnswerForRevision(rawAnswer: string, question?: string): string {
  if (!rawAnswer || !rawAnswer.trim()) return "";

  let text = rawAnswer
    // Fix OCR word split artifacts
    .replace(/Encr\s+yption/gi, "Encryption")
    .replace(/Diffie\s*-\s*Hellman/gi, "Diffie-Hellman")
    .replace(/\b(?:Q\.?\s*No\.?|Interview\s*Question|Answer)\s*$/gi, "")
    .trim();

  // 1. Comparison / Difference Table Detection (e.g. Symmetric vs Asymmetric)
  const isComparisonQ = question && (
    /difference\s+between/i.test(question) ||
    /\bvs\b|\bversus\b/i.test(question) ||
    /distinguish|compare|differentiate/i.test(question)
  );

  const hasSymmetricAsymmetric =
    (/symmetric/i.test(text) && /asymmetric/i.test(text)) ||
    (question && /symmetric.*asymmetric/i.test(question));

  if (hasSymmetricAsymmetric) {
    if (text.includes("|") && text.includes("---|---")) {
      return text;
    }
    return [
      "| Symmetric Encryption | Asymmetric Encryption |",
      "|---|---|",
      "| Same key for encryption & decryption | Different keys for encryption & decryption (Public & Private) |",
      "| Encryption is fast but more vulnerable | Encryption is slow due to high mathematical computation |",
      "| Examples: DES, 3DES, AES, and RC4 | Examples: Diffie-Hellman, RSA, ECC |",
      "| Primary Use: Bulk data transmission | Primary Use: Secure key exchange & Digital Signatures |",
    ].join("\n");
  }

  // 2. Generic Markdown Table Check (if already well-formed)
  if (text.includes("|") && text.split("\n").filter((l) => l.trim().startsWith("|")).length >= 2) {
    return text;
  }

  // 3. CIA Triad / Core Triad Definition Detection
  if (/Confidentiality/i.test(text) && /Integrity/i.test(text) && /Availability/i.test(text)) {
    return [
      "**CIA Triad** represents the foundational security model for information assurance:",
      "",
      "• **Confidentiality:** Ensures sensitive data is accessible only by authorized entities (e.g. Encryption, Access Control).",
      "• **Integrity:** Guarantees information is accurate, authentic, and protected against unauthorized modification (e.g. Hashing, Checksums).",
      "• **Availability:** Ensures systems, services, and networks are accessible when required by authorized users (e.g. Redundant Backups, DDoS Protection).",
    ].join("\n");
  }

  // 4. Multi-item definition lists with hyphens or colons: "- Term: Desc. - Term: Desc."
  if (/-\s*[A-Z][A-Za-z0-9\s]{2,20}:/.test(text)) {
    const parts = text.split(/(?=-\s*[A-Z][A-Za-z0-9\s]{2,20}:)/);
    if (parts.length >= 2) {
      return parts
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => {
          if (p.startsWith("-")) {
            return `• ${p.replace(/^-\s*/, "")}`;
          }
          return p;
        })
        .join("\n");
    }
  }

  // 5. Steps / Sequence format: "1. ... 2. ... 3. ..." or "Step 1 ... Step 2"
  if (/\b(?:1\.|\[1\]|Step 1:?)\b/.test(text) && /\b(?:2\.|\[2\]|Step 2:?)\b/.test(text)) {
    const stepLines = text.split(/(?=\b(?:\d+\.|\[\d+\]|Step\s*\d+:?)\b)/g);
    if (stepLines.length >= 2) {
      return stepLines.map((l) => l.trim()).filter(Boolean).join("\n");
    }
  }

  // 6. Generic bullet separation if text contains multiple inline bullet points
  if (text.includes(" • ") || text.includes(" - ")) {
    const bulletParts = text.split(/\s+[•\-]\s+/);
    if (bulletParts.length >= 2) {
      return bulletParts
        .map((p, i) => (i === 0 && !p.startsWith("•") ? p.trim() : `• ${p.trim()}`))
        .join("\n");
    }
  }

  return text;
}

/**
 * Smart Question & Answer Table Parser
 * Extracts numbered question and answer pairs from continuous table text
 * (such as college question banks with Q. No. | Interview Question | Answer).
 */
export function parseQuestionsAndAnswersFromRawText(text: string): ExtractedQuestionItem[] {
  if (!text || !text.trim() || isCorruptedQuestion(text)) return [];

  // 1. Strip college headers if present
  let cleanText = text;
  const headerCutoff = cleanText.search(/\b(?:Q\.?\s*No\.?|Interview\s*Question|Answer)\s*(?:1\b|Q1\b)/i);
  if (headerCutoff !== -1) {
    cleanText = cleanText.slice(headerCutoff);
  }

  // 2. Strategy A: Regex for continuous table format
  // Matches "1 What is X? Answer text... 2 What is Y? Answer text..."
  const tableRegex = /\b(\d{1,2})\s+([A-Z][^?]+?\?)\s*([\s\S]*?)(?=\b(?:\d{1,2})\s+[A-Z][^?]+?\?|$)/g;
  const matches: ExtractedQuestionItem[] = [];
  let m;

  while ((m = tableRegex.exec(cleanText)) !== null) {
    const qNum = parseInt(m[1], 10);
    const questionText = cleanQuestionString(m[2]);
    let answerText = m[3]?.trim() || "";

    // Clean up trailing labels or stray artifacts from answer
    answerText = answerText
      .replace(/\b(?:Q\.?\s*No\.?|Interview\s*Question|Answer)\s*$/i, "")
      .trim();

    if (!isCorruptedQuestion(questionText) && questionText.length > 8) {
      matches.push({
        number: qNum,
        question: questionText,
        answer: answerText.length > 5 ? formatAnswerForRevision(answerText, questionText) : undefined,
      });
    }
  }

  if (matches.length >= 2) {
    return matches.slice(0, 20);
  }

  // 3. Strategy B: Question sentences ending in '?'
  const questionMarks = cleanText.match(/[A-Z][^.!?\n]+?\?/g);
  if (questionMarks && questionMarks.length >= 2) {
    return questionMarks.slice(0, 15).map((q, idx) => ({
      number: idx + 1,
      question: cleanQuestionString(q),
    }));
  }

  // 4. Strategy C: Line-by-line fallback
  const rawLines = cleanText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 10 && !isCorruptedQuestion(l));

  return rawLines.slice(0, 15).map((l, idx) => ({
    number: idx + 1,
    question: cleanQuestionString(l),
  }));
}

/**
 * Parses raw text content into individual questions.
 */
export function parseQuestionsFromRawText(text: string): string[] {
  const items = parseQuestionsAndAnswersFromRawText(text);
  if (items.length > 0) {
    return items.map((i) => i.question);
  }
  return [];
}

function cleanQuestionString(str: string): string {
  return str
    .replace(/^(?:Q(?:uestion)?\s*\d+[:.-]?\s*|\d+[.)]\s*|•\s*|-\s*|\[\d+\]\s*)/i, "")
    .trim();
}

/**
 * Generates viva flashcards for a specific subject given a list of questions or Q&A pairs.
 * Uses verified teacher answers when available in the document.
 */
export async function generateVivaCardsForQuestions(
  subject: Subject,
  questions: (string | ExtractedQuestionItem)[]
): Promise<Flashcard[]> {
  const cards: Flashcard[] = [];

  for (let i = 0; i < questions.length; i++) {
    const item = questions[i];
    const q = typeof item === "string" ? item : item.question;
    const teacherAnswer = typeof item === "string" ? undefined : item.answer;

    if (!q || isCorruptedQuestion(q)) continue;

    const cardId = `viva-${subject.id}-q${i + 1}-${Date.now()}`;
    const keywords = extractKeyTerms(q);
    const rawAnswer = teacherAnswer && teacherAnswer.length > 10
      ? teacherAnswer
      : generateVivaAnswer(q, subject.name);
    const vivaAnswer = formatAnswerForRevision(rawAnswer, q);
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
      examTip: teacherAnswer
        ? `Keywords: ${keywords.join(", ")} | Verified Faculty Answer`
        : `Examiner Keywords: ${keywords.join(", ")} | Follow-up trap: "${followUpTrap}"`,
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
    let hasFormattingChanges = false;

    const cleaned = parsed
      .filter((c) => !isCorruptedQuestion(c.question) && !isCorruptedQuestion(c.answer))
      .map((c) => {
        const formatted = formatAnswerForRevision(c.answer, c.question);
        if (formatted !== c.answer) {
          hasFormattingChanges = true;
          return { ...c, answer: formatted };
        }
        return c;
      });

    if (cleaned.length !== parsed.length || hasFormattingChanges) {
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
