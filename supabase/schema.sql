-- ====================================================================
-- Exam-Buddy Master Supabase PostgreSQL Schema
-- Includes pgvector extension, storage bucket, RLS policies,
-- authentication profile sync, spaced repetition tracking, RAG chunking,
-- classroom exam sync, and campus cohorts.
-- ====================================================================

-- 1. Enable Vector Extension for RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Storage Bucket for Study Documents (PDFs, Slides, Notes)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('study-documents', 'study-documents', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
DO $$
BEGIN
  -- Allow public read of study-documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read of study-documents'
  ) THEN
    CREATE POLICY "Allow public read of study-documents" ON storage.objects
      FOR SELECT USING (bucket_id = 'study-documents');
  END IF;

  -- Allow uploads to study-documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow uploads to study-documents'
  ) THEN
    CREATE POLICY "Allow uploads to study-documents" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'study-documents');
  END IF;

  -- Allow delete of study-documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow delete study-documents'
  ) THEN
    CREATE POLICY "Allow delete study-documents" ON storage.objects
      FOR DELETE USING (bucket_id = 'study-documents');
  END IF;
END $$;

-- 3. Profiles Table (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  handle TEXT UNIQUE,
  avatar_url TEXT,
  college_name TEXT DEFAULT 'VJTI Mumbai',
  degree TEXT DEFAULT 'B.Tech',
  department TEXT DEFAULT 'Computer Engineering',
  branch TEXT DEFAULT 'Computer Engineering',
  year_or_semester TEXT DEFAULT 'Semester 5',
  daily_goal_minutes INT DEFAULT 60,
  study_streak INT DEFAULT 0,
  streak_count INT DEFAULT 0,
  total_study_minutes INT DEFAULT 0,
  quiz_accuracy INT DEFAULT 85,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3b. User Login History & Audit Table
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Campus Cohorts Table
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

-- 5. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  degree TEXT NOT NULL DEFAULT 'Engineering',
  term TEXT NOT NULL DEFAULT 'Semester 5',
  color TEXT DEFAULT '#8b5cf6',
  exam_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Units Table
CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  unit_number INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  topics TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Documents & Note Ingestion Table
CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id TEXT,
  unit_id TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT,
  file_size TEXT,
  file_type TEXT DEFAULT 'pdf',
  category TEXT DEFAULT 'Lecture Notes',
  chunk_count INT DEFAULT 0,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Document Chunks & High-Dimensional Embeddings (pgvector RAG)
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL,
  subject_id TEXT,
  unit_id TEXT,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  token_count INT DEFAULT 0,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- High-Scale HNSW Vector Index for sub-10ms similarity search
CREATE INDEX IF NOT EXISTS document_chunks_embedding_hnsw_idx 
ON public.document_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 9. Classroom Exam Timetable Sync Table
CREATE TABLE IF NOT EXISTS public.classroom_exams (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  exam_date TEXT NOT NULL,
  room TEXT DEFAULT 'Main Exam Hall',
  cohort TEXT DEFAULT 'Computer Engineering (B.Tech - Sem 5)',
  units_covered TEXT DEFAULT 'Units 1 to 5',
  added_by TEXT DEFAULT 'Batch Student',
  synced_count INT DEFAULT 1,
  total_marks INT DEFAULT 50,
  exam_type TEXT DEFAULT 'Theory',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Flashcard Decks Table
CREATE TABLE IF NOT EXISTS public.flashcard_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id TEXT,
  unit_id TEXT,
  title TEXT NOT NULL,
  card_count INT DEFAULT 0,
  tag TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Flashcards (SM-2 Spaced Repetition) Table
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  explanation TEXT,
  repetition_level INT DEFAULT 0,
  interval_days INT DEFAULT 1,
  ease_factor FLOAT DEFAULT 2.5,
  next_review_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Quizzes Table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id TEXT,
  title TEXT NOT NULL,
  score INT DEFAULT 0,
  total_questions INT DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Mistake Notebook (Error Log) Table
CREATE TABLE IF NOT EXISTS public.mistake_notebook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id TEXT,
  question TEXT NOT NULL,
  user_wrong_answer TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  reviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Study Focus Logs Table
CREATE TABLE IF NOT EXISTS public.study_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_minutes INT NOT NULL,
  session_type TEXT DEFAULT 'pomodoro',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- RAG VECTOR SIMILARITY SEARCH FUNCTIONS
-- ====================================================================

-- 1. match_document_sections (invoked by frontend rag-service.ts)
CREATE OR REPLACE FUNCTION match_document_sections(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.2,
  match_count int DEFAULT 5,
  filter_subject_id TEXT DEFAULT NULL,
  filter_unit_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  document_id TEXT,
  content TEXT,
  similarity float,
  subject_id TEXT,
  unit_id TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.content,
    1 - (document_chunks.embedding <=> query_embedding) AS similarity,
    document_chunks.subject_id,
    document_chunks.unit_id
  FROM document_chunks
  WHERE (1 - (document_chunks.embedding <=> query_embedding)) > match_threshold
    AND (filter_subject_id IS NULL OR document_chunks.subject_id = filter_subject_id)
    AND (filter_unit_id IS NULL OR document_chunks.unit_id = filter_unit_id)
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 2. match_documents (classic function compatibility)
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.2,
  match_count int DEFAULT 5,
  filter_subject_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  document_id TEXT,
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
  WHERE (1 - (document_chunks.embedding <=> query_embedding)) > match_threshold
    AND (filter_subject_id IS NULL OR document_chunks.subject_id = filter_subject_id)
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistake_notebook ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_cohorts ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read (for leaderboard/cohorts), user can update own profile
CREATE POLICY "Public profiles can be viewed by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Subjects: Public subjects readable by all, users can manage their own
CREATE POLICY "Subjects are viewable by all" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Users can manage own subjects" ON public.subjects FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Units: Viewable by all
CREATE POLICY "Units are viewable by all" ON public.units FOR SELECT USING (true);

-- Documents & Document Chunks: Viewable for RAG, manageable by owner or anon
CREATE POLICY "Documents viewable by all" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Users can insert documents" ON public.documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Document chunks viewable by all" ON public.document_chunks FOR SELECT USING (true);
CREATE POLICY "Users can insert document chunks" ON public.document_chunks FOR INSERT WITH CHECK (true);

-- Classroom Exams: Shared across campus cohorts
CREATE POLICY "Classroom exams viewable by all" ON public.classroom_exams FOR SELECT USING (true);
CREATE POLICY "Classroom exams manageable by all" ON public.classroom_exams FOR ALL USING (true);

-- Flashcards & Decks
CREATE POLICY "Decks viewable by all" ON public.flashcard_decks FOR SELECT USING (true);
CREATE POLICY "Users manage own decks" ON public.flashcard_decks FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Flashcards viewable by all" ON public.flashcards FOR SELECT USING (true);
CREATE POLICY "Users manage own flashcards" ON public.flashcards FOR ALL USING (true);

-- Study Logs: Users manage their study logs
CREATE POLICY "Users manage own study logs" ON public.study_logs FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Study logs readable by all" ON public.study_logs FOR SELECT USING (true);

-- Mistake Notebook: Personal error logs
CREATE POLICY "Users manage own mistake notebook" ON public.mistake_notebook FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Google Drive Integration (BYOS) Connections
CREATE TABLE IF NOT EXISTS public.user_drive_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  google_user_email TEXT,
  google_account_id TEXT,
  scope TEXT DEFAULT 'https://www.googleapis.com/auth/drive.file',
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expiry TIMESTAMPTZ,
  is_connected BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_drive_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own drive connection" 
  ON public.user_drive_connections FOR ALL 
  USING (auth.uid() = user_id);

ALTER TABLE public.documents 
  ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'local_upload' CHECK (source_type IN ('local_upload', 'google_drive')),
  ADD COLUMN IF NOT EXISTS drive_file_id TEXT,
  ADD COLUMN IF NOT EXISTS drive_web_link TEXT;

