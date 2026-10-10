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

/**
 * Saves authenticated Google/Gmail user metadata and login audit into app database tables
 */
export async function syncGoogleUserToDatabase(user: any) {
  if (!user) return;

  const email = user.email || '';
  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    email.split('@')[0] ||
    'Student User';
  const avatarUrl =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    null;
  const provider = user.app_metadata?.provider || 'google';

  // Local storage backup for client persistence
  if (typeof window !== 'undefined') {
    const existing = localStorage.getItem('exambuddy_cohort_user');
    let prev = {};
    if (existing) {
      try { prev = JSON.parse(existing); } catch {}
    }
    localStorage.setItem(
      'exambuddy_cohort_user',
      JSON.stringify({
        ...prev,
        email,
        name: fullName,
        full_name: fullName,
        avatar: avatarUrl,
        provider,
        lastLoginAt: new Date().toISOString(),
      })
    );
  }

  if (!isSupabaseConfigured()) return;

  try {
    const supabase = createClient();
    
    // Upsert into profiles
    await supabase.from('profiles').upsert(
      {
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    // Insert into user_logins audit table
    await supabase.from('user_logins').insert({
      user_id: user.id,
      email,
      provider,
      login_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Exam-Buddy] Failed to sync Google user to database:', err);
  }
}

/**
 * Fetches recent login audit records for current user
 */
export async function fetchUserLoginHistory() {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];

    const { data, error } = await supabase
      .from('user_logins')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('login_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[Exam-Buddy] Error fetching user login history:', err);
    return [];
  }
}


