import { createClient } from '@/lib/supabase/client';

export type ChatScope = 'scope1_unit' | 'scope2_multi_unit' | 'scope3_subject' | 'scope4_global';
export type ExplanationLevel = 'simple' | 'medium' | 'exam';

export interface RagContextMatch {
  id: string;
  documentId: string;
  content: string;
  similarity: number;
}

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return Boolean(url && !url.includes('placeholder'));
};

/**
 * Performs 4-Scope RAG similarity search against Supabase document sections
 */
export async function retrieveRagContext(
  prompt: string,
  scope: ChatScope,
  subjectId?: string,
  unitId?: string
): Promise<RagContextMatch[]> {
  if (!isSupabaseConfigured()) {
    console.warn('[Exam-Buddy RAG] Running in mock context mode. Vector database unavailable.');
    return [
      {
        id: 'mock-section-1',
        documentId: 'doc-1',
        content: `[Scope Grounding Context]: Subject concepts for ${subjectId || 'DSA'} - Key definitions, algorithmic complexities (O(1), O(N log N)), binary search tree invariants, and 5-mark exam answer structures.`,
        similarity: 0.88,
      },
    ];
  }

  try {
    const supabase = createClient();

    // 1. Generate query embedding vector
    const vectorResponse = await fetch('/api/ingest-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawText: prompt,
        documentId: 'query',
      }),
    });

    const vectorData = await vectorResponse.json();
    const queryEmbedding = vectorData.sections?.[0]?.embedding;

    if (!queryEmbedding) {
      return [];
    }

    // 2. Determine RPC filter arguments based on Scope
    let filterSubject = subjectId || null;
    let filterUnit = unitId || null;

    if (scope === 'scope3_subject') {
      filterUnit = null; // Search all units of this subject
    } else if (scope === 'scope4_global') {
      filterSubject = null; // Search all subjects globally
      filterUnit = null;
    }

    // 3. Query match_document_sections RPC function in Supabase
    const { data, error } = await supabase.rpc('match_document_sections', {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: 5,
      filter_subject_id: filterSubject,
      filter_unit_id: filterUnit,
    });

    if (error || !data) {
      console.warn('[Exam-Buddy RAG] RPC match_document_sections error:', error);
      return [];
    }

    return data as RagContextMatch[];
  } catch (err) {
    console.error('[Exam-Buddy RAG] Retrieval error:', err);
    return [];
  }
}

/**
 * Constructs hierarchical system prompt for the AI model based on Scope & Explanation Level
 */
export function buildRagSystemPrompt(
  scope: ChatScope,
  explanationLevel: ExplanationLevel,
  retrievedMatches: RagContextMatch[],
  subjectName?: string,
  unitName?: string
): string {
  const levelDescriptions = {
    simple: 'Beginner-friendly, intuitive language with real-world analogies and simple diagrams.',
    medium: 'Conceptual depth, technical terminology, formulas, and step-by-step logic.',
    exam: 'University academic exam standard with 5/10-mark structured answers (Definition ➔ Architecture ➔ Pros/Cons ➔ Example).',
  };

  const scopeDescriptions = {
    scope1_unit: `Scope 1: Deep focus on current unit (${unitName || 'Selected Unit'}).`,
    scope2_multi_unit: `Scope 2: Multi-Unit Synthesis combining Units 1 & 2 for midterm revision.`,
    scope3_subject: `Scope 3: Full Subject Master Tutor for ${subjectName || 'Entire Course'}.`,
    scope4_global: `Scope 4: Cross-subject Academic Strategist & Timetable Tutor.`,
  };

  const contextBlock = retrievedMatches.length > 0
    ? retrievedMatches.map((m, idx) => `[Source Chunk ${idx + 1}]:\n${m.content}`).join('\n\n')
    : 'No external document sections matches found. Rely on verified core academic principles.';

  return `You are Exam-Buddy AI Tutor, an expert academic assistant for engineering and university students.

Mode & Rules:
- ${scopeDescriptions[scope]}
- Target Explanation Depth: ${levelDescriptions[explanationLevel]}
- Ground your answers in the retrieved course context below whenever relevant.

=== RETRIEVED COURSE CONTEXT ===
${contextBlock}
================================

Format your answers with clean Markdown headings, bullet points, formula code blocks, and clear step-by-step reasoning.`;
}
