-- ====================================================================
-- Exam-Buddy Master Supabase PostgreSQL Schema
-- Includes vector extension, authentication profile sync, RLS policies,
-- spaced repetition tracking, RAG chunking, and campus cohorts.
-- ====================================================================

-- 1. Enable Vector Extension for RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Profiles Table (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  handle TEXT UNIQUE,
  avatar_url TEXT,
  college_name TEXT,
  degree TEXT,
  department TEXT,
  year_or_semester TEXT,
  daily_goal_minutes INT DEFAULT 60,
  streak_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2b. User Login History & Audit Table
CREATE TABLE IF NOT EXISTS public.user_logins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  provider TEXT DEFAULT 'google',
  user_agent TEXT,
  ip_address TEXT,
  login_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatic Google OAuth User Creation & Sync Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();

  INSERT INTO public.user_logins (user_id, email, provider, login_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_app_meta_data->>'provider', 'google'),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger for auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Campus Cohorts
CREATE TABLE IF NOT EXISTS public.campus_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_name TEXT NOT NULL,
  department TEXT NOT NULL,
  degree TEXT NOT NULL,
  year_or_semester TEXT NOT NULL,
  member_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(college_name, department, degree, year_or_semester)
);

-- 4. Subjects
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  degree TEXT NOT NULL,
  term TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  exam_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Units
CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  unit_number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  topics TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Documents & Note Ingestion
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  ocr_status TEXT DEFAULT 'completed',
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Document Chunks & Embeddings (RAG)
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- High-Scale HNSW Vector Index for sub-10ms similarity search
CREATE INDEX IF NOT EXISTS document_chunks_embedding_hnsw_idx 
ON public.document_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 8. Flashcard Decks
CREATE TABLE IF NOT EXISTS public.flashcard_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  card_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Flashcards (SM-2 Spaced Repetition)
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  explanation TEXT,
  repetition_level INT DEFAULT 0,
  interval_days INT DEFAULT 1,
  ease_factor FLOAT DEFAULT 2.5,
  next_review_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Quizzes & Quiz Questions
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  score INT DEFAULT 0,
  total_questions INT DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Mistake Notebook (Error Log)
CREATE TABLE IF NOT EXISTS public.mistake_notebook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  user_wrong_answer TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  reviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Study Focus Logs
CREATE TABLE IF NOT EXISTS public.study_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_minutes INT NOT NULL,
  session_type TEXT DEFAULT 'pomodoro',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistake_notebook ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view & edit their own profile
CREATE POLICY "Users can manage their own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Subjects: Users manage their subjects
CREATE POLICY "Users manage their subjects" ON public.subjects
  FOR ALL USING (auth.uid() = user_id);

-- Documents: Users manage their uploaded documents
CREATE POLICY "Users manage their documents" ON public.documents
  FOR ALL USING (auth.uid() = user_id);

-- Flashcards & Decks: Users manage their decks
CREATE POLICY "Users manage their decks" ON public.flashcard_decks
  FOR ALL USING (auth.uid() = user_id);

-- Study Logs: Users manage their study logs
CREATE POLICY "Users manage their study logs" ON public.study_logs
  FOR ALL USING (auth.uid() = user_id);

-- ====================================================================
-- RAG Vector Search Function
-- ====================================================================
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_subject_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.content,
    1 - (document_chunks.embedding <=> query_embedding) AS similarity
  FROM document_chunks
  WHERE 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
    AND (filter_subject_id IS NULL OR document_chunks.subject_id = filter_subject_id)
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
