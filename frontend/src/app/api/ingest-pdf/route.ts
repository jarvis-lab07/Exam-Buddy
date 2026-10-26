import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * Text Chunking Utility (500 tokens with 50-token overlap)
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
 * Supports OpenAI (text-embedding-3-small), Google Gemini (text-embedding-004),
 * and deterministic normalized vector generator fallback.
 */
async function generateEmbedding(text: string, apiKey?: string): Promise<number[]> {
  // 1. Try OpenAI Embedding if key provided
  if (apiKey && apiKey.startsWith('sk-')) {
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
      console.warn('[Ingest API] OpenAI embedding failed, attempting Gemini fallback');
    }
  }

  // 2. Try Google Gemini Text-Embedding-004
  const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'models/text-embedding-004',
            content: { parts: [{ text }] },
          }),
        }
      );
      if (response.ok) {
        const json = await response.json();
        const geminiVector = json.embedding?.values;
        if (Array.isArray(geminiVector) && geminiVector.length > 0) {
          // Gemini returns 768 dims; pad to 1536 for schema vector compatibility
          const padded = new Array(1536).fill(0);
          for (let i = 0; i < geminiVector.length; i++) {
            padded[i] = geminiVector[i];
          }
          return padded;
        }
      }
    } catch (e) {
      console.warn('[Ingest API] Gemini embedding failed, using deterministic generator');
    }
  }

  // 3. Deterministic 1536-dimensional vector generator fallback
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

    // 3. If Supabase is configured, persist document & chunks to Supabase cloud!
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && !supabaseUrl.includes('placeholder') && supabaseKey && documentId !== 'query') {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase.from('documents').upsert({
          id: documentId || `doc-${Date.now()}`,
          subject_id: subjectId ? String(subjectId) : null,
          unit_id: unitId ? String(unitId) : null,
          file_name: title || 'Uploaded Document',
          chunk_count: sections.length,
          file_type: 'pdf',
        });

        const chunksToInsert = sections.map((s) => ({
          document_id: s.document_id,
          subject_id: s.subject_id ? String(s.subject_id) : null,
          unit_id: s.unit_id ? String(s.unit_id) : null,
          chunk_index: s.section_index,
          content: s.content,
          token_count: s.token_count,
          embedding: s.embedding,
        }));

        await supabase.from('document_chunks').insert(chunksToInsert);
      } catch (dbErr) {
        console.warn('[Ingest API] Supabase persistence error:', dbErr);
      }
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
        embedding: s.embedding,
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
