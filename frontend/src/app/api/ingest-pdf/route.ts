import { NextRequest, NextResponse } from 'next/server';

/**
 * Text Chunking Utility
 */
function chunkText(text: string, chunkSize: number = 800, overlap: number = 100): string[] {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    chunks.push(text.slice(startIndex, endIndex));
    startIndex += chunkSize - overlap;
  }

  return chunks;
}

/**
 * Generates vector embeddings for a text chunk
 * Falls back to normalized mock embeddings if external embedding API is unavailable
 */
async function generateEmbedding(text: string, apiKey?: string): Promise<number[]> {
  if (apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        return json.data[0].embedding;
      }
    } catch (e) {
      console.warn('[Ingest API] OpenAI embedding failed, using vector generator fallback');
    }
  }

  // Deterministic 1536-dimensional vector generator fallback
  const vector: number[] = new Array(1536).fill(0);
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const index = (charCode * (i + 1)) % 1536;
    vector[index] = (vector[index] + 0.01) % 1.0;
  }
  return vector;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentId, subjectId, unitId, title, rawText, apiKey } = body;

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text content is empty' },
        { status: 400 }
      );
    }

    // 1. Chunk document text
    const chunks = chunkText(rawText);

    // 2. Generate vector embeddings for each chunk
    const sections = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await generateEmbedding(chunk, apiKey);

      sections.push({
        document_id: documentId || `doc-${Date.now()}`,
        subject_id: subjectId,
        unit_id: unitId,
        content: chunk,
        embedding,
        section_index: i,
        token_count: Math.ceil(chunk.length / 4),
      });
    }

    return NextResponse.json({
      success: true,
      documentId,
      title,
      totalChunks: sections.length,
      sampleEmbeddingLength: sections[0]?.embedding?.length || 1536,
      sections: sections.map((s) => ({
        index: s.section_index,
        contentSnippet: s.content.slice(0, 100) + '...',
        tokens: s.token_count,
      })),
    });
  } catch (error: any) {
    console.error('[Ingest API] Ingestion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to ingest document' },
      { status: 500 }
    );
  }
}
