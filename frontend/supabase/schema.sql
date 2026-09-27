-- Exam-Buddy Master PostgreSQL Schema & Vector RAG Setup
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Enable Vector Extension for RAG Search
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Student Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  handle TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  college_name TEXT,
  degree TEXT,
  branch TEXT,
  semester INT DEFAULT 1,
  study_streak INT DEFAULT 1,
  total_study_minutes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  degree TEXT NOT NULL,
  term TEXT NOT NULL,
  color TEXT DEFAULT '#7C3AED',
  exam_date DATE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Syllabus Units Table
CREATE TABLE IF NOT EXISTS public.units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  number INT NOT NULL,
  title TEXT NOT NULL,
  topics TEXT[] DEFAULT '{}',
  pyq_count INT DEFAULT 0,
  status TEXT CHECK (status IN ('completed', 'in_progress', 'not_started')) DEFAULT 'not_started',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Uploaded Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  raw_text TEXT,
  status TEXT CHECK (status IN ('uploaded', 'processing', 'indexed', 'failed')) DEFAULT 'uploaded',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Document Section Chunks & Vector Embeddings for RAG
CREATE TABLE IF NOT EXISTS public.document_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536), -- Vector dimensions for text-embedding-3-small
  token_count INT,
  section_index INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast vector similarity search
CREATE INDEX IF NOT EXISTS document_sections_embedding_idx 
  ON public.document_sections 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);

-- 7. Flashcard Decks & Cards Table
CREATE TABLE IF NOT EXISTS public.flashcard_decks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  card_count INT DEFAULT 0,
  mastery_percentage INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID REFERENCES public.flashcard_decks(id) ON DELETE CASCADE NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  explanation TEXT,
  repetition_level INT DEFAULT 0,
  interval_days FLOAT DEFAULT 1,
  ease_factor FLOAT DEFAULT 2.5,
  next_review_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Study Focus Logs
CREATE TABLE IF NOT EXISTS public.study_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  duration_minutes INT NOT NULL,
  session_type TEXT DEFAULT 'pomodoro', -- 'pomodoro', 'flashcards', 'quiz', 'ai_chat'
  completed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. RLS (Row Level Security) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_logs ENABLE ROW LEVEL SECURITY;

-- Simple User Isolation Policies
CREATE POLICY "Users can manage their own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage their own subjects" ON public.subjects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access units of their subjects" ON public.units FOR ALL USING (
  EXISTS (SELECT 1 FROM public.subjects WHERE id = units.subject_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage their documents" ON public.documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access sections of their documents" ON public.document_sections FOR ALL USING (
  EXISTS (SELECT 1 FROM public.documents WHERE id = document_sections.document_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage flashcard decks" ON public.flashcard_decks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage flashcards" ON public.flashcards FOR ALL USING (
  EXISTS (SELECT 1 FROM public.flashcard_decks WHERE id = flashcards.deck_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage study logs" ON public.study_logs FOR ALL USING (auth.uid() = user_id);

-- 10. Vector Similarity Match Function for RAG Chat (4-Scope Engine)
CREATE OR REPLACE FUNCTION match_document_sections (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5,
  filter_subject_id uuid DEFAULT NULL,
  filter_unit_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ds.id,
    ds.document_id,
    ds.content,
    1 - (ds.embedding <=> query_embedding) AS similarity
  FROM public.document_sections ds
  JOIN public.documents d ON d.id = ds.document_id
  WHERE 
    d.user_id = auth.uid()
    AND (1 - (ds.embedding <=> query_embedding)) > match_threshold
    AND (filter_subject_id IS NULL OR ds.subject_id = filter_subject_id)
    AND (filter_unit_id IS NULL OR ds.unit_id = filter_unit_id)
  ORDER BY ds.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
