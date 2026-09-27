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
    console.warn('[Exam-Buddy RAG] Running in mock context mode. Generating topic-matched RAG context.');
    
    const queryLower = prompt.toLowerCase();
    const isICS = queryLower.includes('ics') || queryLower.includes('cyber') || queryLower.includes('security') || queryLower.includes('crypto');
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
    } else if (scope === 'scope4_global' || prompt.match(/([a-zA-Z0-9_\-]+\.(pdf|pptx|ppt|docx|doc|txt))/i)) {
      filterSubject = null; // Search all subjects globally if document name present
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

  const isDocQuery = subjectName?.includes('Uploaded Document') || unitName?.includes('Document:');

  const safeUnitName = isDocQuery 
    ? (unitName || 'Uploaded Notes / Slide Deck')
    : (unitName && !unitName.toLowerCase().includes('balancing') ? unitName : 'Selected Syllabus Unit');

  const scopeDescriptions = {
    scope1_unit: `Scope 1: Deep focus on requested study notes / module (${safeUnitName}). Ground response strictly in the user's document context. Do NOT talk about unrelated subjects or Data Structures trees unless the document is explicitly about Trees.`,
    scope2_multi_unit: `Scope 2: Multi-Unit Synthesis combining syllabus modules for midterm revision.`,
    scope3_subject: `Scope 3: Full Subject Master Tutor for ${subjectName || 'Course'}.`,
    scope4_global: `Scope 4: Cross-subject Academic Strategist & Timetable Tutor.`,
  };

  const contextBlock = retrievedMatches.length > 0
    ? retrievedMatches.map((m, idx) => `[Source Chunk ${idx + 1}]:\n${m.content}`).join('\n\n')
    : 'No external document sections matches found. Rely on verified core academic principles for the requested document/topic.';

  return `You are Exam-Buddy AI Tutor, an expert academic assistant for university students.

Mode & Rules:
- ${scopeDescriptions[scope]}
- Target Explanation Depth: ${levelDescriptions[explanationLevel]}
- Ground your answer strictly in the subject and document specified in the prompt and retrieved context below. Do NOT assume the query is about Data Structures or AVL Trees unless explicitly requested.

=== RETRIEVED COURSE CONTEXT ===
${contextBlock}
================================

Format your answer with clear Markdown headings, bullet points, and step-by-step reasoning tailored specifically to the user's requested document or topic.`;
}

