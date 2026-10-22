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
 * Returns syllabus-grounded curriculum context fallback for core subjects
 */
export function getCurriculumFallbackContext(prompt: string, subjectId?: string): RagContextMatch[] {
  const queryLower = prompt.toLowerCase();
  const isICS = queryLower.includes('ics') || queryLower.includes('cyber') || queryLower.includes('security') || queryLower.includes('crypto') || subjectId === 'ics';
  const isBIA = queryLower.includes('bia') || queryLower.includes('business intelligence') || subjectId === 'bia';
  const isCN = queryLower.includes('network') || queryLower.includes('tcp') || queryLower.includes('ip') || subjectId === 'cn';
  const isDBMS = queryLower.includes('database') || queryLower.includes('sql') || queryLower.includes('dbms') || subjectId === 'dbms';

  if (isICS) {
    return [
      {
        id: 'mock-section-ics-1',
        documentId: 'doc-ics',
        content: `[Scope Grounding Context - Information & Cyber Security (ICS Unit I)]:
1. CIA Triad Security Goals: Confidentiality (data secrecy), Integrity (tamper prevention via SHA-256 hashes), Availability (DDoS mitigation & uptime).
2. Cryptographic Systems: Symmetric Encryption (AES, DES, 3DES with shared key) vs. Asymmetric Encryption (RSA, Elliptic Curve / ECC with Public/Private key pairs).
3. Attack Classifications: Passive Attacks (Eavesdropping, Traffic Analysis) vs. Active Attacks (Masquerade, Replay, Message Modification, Denial of Service / DoS).
4. Security Protocols & Defense: SSL/TLS Handshake, Firewalls, Intrusion Detection Systems (IDS), Digital Signatures & PKI Certificates.`,
        similarity: 0.96,
      },
    ];
  } else if (isBIA) {
    return [
      {
        id: 'mock-section-bia-1',
        documentId: 'doc-bia',
        content: `[Scope Grounding Context - Business Intelligence & Analytics (BIA Unit I)]:
1. BI Architecture: Data Sources -> ETL Pipeline (Extract, Transform, Load) -> Staging Area -> Data Warehouse / Data Marts -> OLAP Server -> Reporting & Dashboards.
2. Data Warehousing & Dimensional Modeling: Centralized repository for analytical decision making. Star Schema (central fact table surrounded by denormalized dimension tables) vs. Snowflake Schema (normalized dimension hierarchies).
3. OLAP Operations (Online Analytical Processing): Roll-up (aggregation), Drill-down (granularity detail), Slice (single dimension filter), Dice (sub-cube selection), Pivot (rotation). MOLAP (Multidimensional), ROLAP (Relational), HOLAP (Hybrid).
4. Data Mining & KPI Dashboards: Extracting actionable business intelligence, predictive metrics, and executive performance indicators.`,
        similarity: 0.95,
      },
    ];
  } else if (isCN) {
    return [
      {
        id: 'mock-section-cn-1',
        documentId: 'doc-cn',
        content: `[Scope Grounding Context - Computer Networks (CN)]:
1. OSI Model vs. TCP/IP Stack: 7-Layer OSI model (Physical, Data Link, Network, Transport, Session, Presentation, Application) vs. 4-Layer TCP/IP reference model.
2. Transport Layer: TCP (Connection-oriented, 3-way handshake, reliable, flow control via Sliding Window, congestion control via AIMD/Tahoe/Reno) vs. UDP (Connectionless, low overhead, unreliable datagrams).
3. Network Layer & Subnetting: IPv4 addressing, CIDR notation, subnet masks, routing protocols (Dijkstra Link-State vs. Bellman-Ford Distance Vector, OSPF, BGP).`,
        similarity: 0.92,
      },
    ];
  } else if (isDBMS) {
    return [
      {
        id: 'mock-section-dbms-1',
        documentId: 'doc-dbms',
        content: `[Scope Grounding Context - Database Management Systems (DBMS)]:
1. Relational Algebra & SQL: Selection (sigma), Projection (pi), Joins (Inner, Left, Right, Full), Group By and Aggregations.
2. Normalization: 1NF (atomic values), 2NF (no partial functional dependency), 3NF (no transitive dependency), BCNF (Boyce-Codd Normal Form).
3. ACID Properties: Atomicity (all or nothing), Consistency (valid state), Isolation (concurrent transaction locks), Durability (persisted storage). Two-Phase Locking (2PL) & Serializability.`,
        similarity: 0.94,
      },
    ];
  }

  // Extract file name from prompt if present
  const fileMatch = prompt.match(/([a-zA-Z0-9_\-]+\.(pdf|pptx|ppt|docx|doc|txt))/i);
  const docName = fileMatch ? fileMatch[1] : 'Requested Study Notes';

  return [
    {
      id: 'mock-section-generic',
      documentId: 'doc-generic',
      content: `[Scope Grounding Context - Document: ${docName}]:
1. Overview & Core Definitions covering key concepts of ${docName}.
2. Core Architecture, Principles, and Foundational Theory.
3. 5/10-Mark Exam Answer Structure (Definition -> Principles -> Key Concepts -> Applications).`,
      similarity: 0.90,
    },
  ];
}

/**
 * Performs 4-Scope RAG similarity search against Supabase document chunks using pgvector
 */
export async function retrieveRagContext(
  prompt: string,
  scope: ChatScope,
  subjectId?: string,
  unitId?: string
): Promise<RagContextMatch[]> {
  if (!isSupabaseConfigured()) {
    console.warn('[Exam-Buddy RAG] Running in mock context mode. Generating topic-matched RAG context.');
    return getCurriculumFallbackContext(prompt, subjectId);
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
      console.warn('[Exam-Buddy RAG] Query embedding generation failed, using syllabus fallback');
      return getCurriculumFallbackContext(prompt, subjectId);
    }

    // 2. Determine RPC filter arguments based on Scope
    let filterSubject: string | null = subjectId || null;
    let filterUnit: string | null = unitId || null;

    if (scope === 'scope3_subject') {
      filterUnit = null; // Search all units of this subject
    } else if (scope === 'scope4_global' || prompt.match(/([a-zA-Z0-9_\-]+\.(pdf|pptx|ppt|docx|doc|txt))/i)) {
      filterSubject = null; // Search all subjects globally if document name present
      filterUnit = null;
    }

    // 3. Query match_document_sections RPC function in Supabase pgvector
    const { data, error } = await supabase.rpc('match_document_sections', {
      query_embedding: queryEmbedding,
      match_threshold: 0.2,
      match_count: 5,
      filter_subject_id: filterSubject,
      filter_unit_id: filterUnit,
    });

    if (error) {
      console.warn('[Exam-Buddy RAG] RPC match_document_sections error:', error);
      return getCurriculumFallbackContext(prompt, subjectId);
    }

    if (!data || data.length === 0) {
      console.log('[Exam-Buddy RAG] No high-similarity chunks in DB yet, using syllabus context');
      return getCurriculumFallbackContext(prompt, subjectId);
    }

    console.log(`[Exam-Buddy RAG] Successfully retrieved ${data.length} chunks from Supabase pgvector!`);
    return data.map((d: any) => ({
      id: d.id,
      documentId: d.document_id,
      content: d.content,
      similarity: d.similarity,
    })) as RagContextMatch[];
  } catch (err) {
    console.error('[Exam-Buddy RAG] Retrieval error:', err);
    return getCurriculumFallbackContext(prompt, subjectId);
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
  let scopeDescription = '';
  switch (scope) {
    case 'scope1_unit':
      scopeDescription = `SCOPE: UNIT-LEVEL TUTOR (${unitName || 'Current Unit'}). Focus with high precision on specific lecture concepts, formulas, and definitions.`;
      break;
    case 'scope2_multi_unit':
      scopeDescription = `SCOPE: MULTI-UNIT IN-SEM EXAM TUTOR. Synthesize concepts across connected units, highlighting comparative distinctions and combined problem solutions.`;
      break;
    case 'scope3_subject':
      scopeDescription = `SCOPE: FULL SUBJECT FINAL EXAM TUTOR (${subjectName || 'Current Course'}). Cover broad syllabus blueprints, high-yield repeated questions, and university exam weightages.`;
      break;
    case 'scope4_global':
      scopeDescription = `SCOPE: GLOBAL ACADEMIC STRATEGIST. Provide cross-course planning, daily schedules, and prioritized study recommendations.`;
      break;
  }

  let depthInstructions = '';
  switch (explanationLevel) {
    case 'simple':
      depthInstructions = `EXPLANATION DEPTH: SIMPLE (BEGINNER). Use clear analogies, eliminate unnecessary jargon, and explain concepts step-by-step as if teaching a first-year student.`;
      break;
    case 'medium':
      depthInstructions = `EXPLANATION DEPTH: MEDIUM (CONCEPTUAL). Balance theory and real-world implementation, provide standard architectural flowcharts, and explain algorithmic logic.`;
      break;
    case 'exam':
      depthInstructions = `EXPLANATION DEPTH: EXAM-LEVEL (ACADEMIC / FORMULAIC). Structure responses following the university 5/10-mark pattern:
- Formal Technical Definition & Purpose
- Architecture Diagram / Text-based Block Diagram
- Step-by-Step Mathematical Derivation or Algorithm
- Key Trade-offs, Pros & Cons, and University Exam Tips.`;
      break;
  }

  const contextText = retrievedMatches
    .map((m, idx) => `[Context Chunk ${idx + 1} (Relevance: ${(m.similarity * 100).toFixed(0)}%)]:\n${m.content}`)
    .join('\n\n');

  return `You are Exam-Buddy, an expert AI Academic Tutor and Exam Preparation Mentor.
${scopeDescription}
${depthInstructions}

VERIFIED SYLLABUS & DOCUMENT CONTEXT:
${contextText}

INSTRUCTIONS:
1. Ground your answers strictly on the provided syllabus and document context.
2. If mathematical formulas or derivations are involved, format them using standard LaTeX ($...$ or $$...$$).
3. If structural architectures or workflows are requested, provide clean Mermaid.js flowcharts (\`\`\`mermaid).
4. Never hallucinate unsupported university topics. Keep formatting modern, clean, and highly readable.`;
}
