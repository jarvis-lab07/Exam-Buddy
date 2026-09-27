import { createClient } from '@/lib/supabase/client';
import { MOCK_SUBJECTS, MOCK_FLASHCARD_DECKS } from '@/lib/mock-data';
import { Subject, Unit, FlashcardDeck } from '@/types';


const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return Boolean(url && !url.includes('placeholder'));
};

/**
 * Subject & Unit Database Operations with Mock Fallback
 */
export async function fetchSubjects(): Promise<Subject[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_SUBJECTS;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('subjects')
    .select('*, units(*)');

  if (error || !data || data.length === 0) {
    console.warn('[Exam-Buddy] Supabase fetchSubjects fallback to mock data:', error);
    return MOCK_SUBJECTS;
  }

  return data as Subject[];
}

export async function createSubjectInDb(subject: Omit<Subject, 'id'>): Promise<Subject> {
  const newSubject: Subject = {
    ...subject,
    id: `subj-${Date.now()}`,
  };

  if (!isSupabaseConfigured()) {
    MOCK_SUBJECTS.unshift(newSubject);
    return newSubject;
  }

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    // Save to mock fallback if offline or guest
    MOCK_SUBJECTS.unshift(newSubject);
    return newSubject;
  }

  const { data, error } = await supabase
    .from('subjects')
    .insert({
      user_id: userData.user.id,
      title: subject.title,
      code: subject.code,
      degree: subject.degree,
      term: subject.semesterOrYear,
      color: subject.color,
      exam_date: subject.examDate,

    })
    .select()
    .single();

  if (error) {
    console.error('[Exam-Buddy] Error creating subject in Supabase:', error);
    MOCK_SUBJECTS.unshift(newSubject);
    return newSubject;
  }

  return data as Subject;
}

/**
 * Flashcard Decks & Review Persistence
 */
export async function fetchFlashcardDecks(): Promise<FlashcardDeck[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_FLASHCARD_DECKS;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('flashcard_decks')
    .select('*, flashcards(*)');

  if (error || !data || data.length === 0) {
    return MOCK_FLASHCARD_DECKS;
  }

  return data as FlashcardDeck[];
}

export async function updateFlashcardReview(
  cardId: string,
  sm2State: { repetition: number; interval: number; easeFactor: number; nextReviewAt: string }
) {
  if (!isSupabaseConfigured()) return;

  const supabase = createClient();
  await supabase.from('flashcards').update({
    repetition_level: sm2State.repetition,
    interval_days: sm2State.interval,
    ease_factor: sm2State.easeFactor,
    next_review_at: sm2State.nextReviewAt,
  }).eq('id', cardId);
}

/**
 * Study Focus Logger
 */
export async function recordStudyLog(durationMinutes: number, sessionType: string = 'pomodoro') {
  if (!isSupabaseConfigured()) return;

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  await supabase.from('study_logs').insert({
    user_id: userData.user.id,
    duration_minutes: durationMinutes,
    session_type: sessionType,
  });
}

