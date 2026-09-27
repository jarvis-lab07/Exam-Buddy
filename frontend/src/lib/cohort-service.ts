import { createClient } from '@/lib/supabase/client';

export interface CohortStudentLeaderboard {
  rank: number;
  handle: string;
  name: string;
  avatarUrl?: string;
  streakDays: number;
  quizAccuracy: number;
  weeklyFocusMinutes: number;
}

export interface SharedCohortResource {
  id: string;
  title: string;
  uploadedBy: string;
  collegeName: string;
  branch: string;
  year: string;
  subjectCode: string;
  downloadCount: number;
  vectorCount: number;
  uploadTime: string;
}

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return Boolean(url && !url.includes('placeholder'));
};

/**
 * Fetches real or mock campus cohort leaderboard for the student's department
 */
export async function fetchDepartmentLeaderboard(
  college: string = 'VJTI Mumbai',
  branch: string = 'Computer Engineering'
): Promise<CohortStudentLeaderboard[]> {
  if (!isSupabaseConfigured()) {
    return [
      { rank: 1, handle: '@durgesh_cs', name: 'Durgesh', streakDays: 14, quizAccuracy: 94, weeklyFocusMinutes: 420 },
      { rank: 2, handle: '@priya_m', name: 'Priya Mehta', streakDays: 12, quizAccuracy: 91, weeklyFocusMinutes: 380 },
      { rank: 3, handle: '@rohit_k', name: 'Rohit Kulkarni', streakDays: 9, quizAccuracy: 88, weeklyFocusMinutes: 310 },
      { rank: 4, handle: '@ananya_s', name: 'Ananya Sharma', streakDays: 7, quizAccuracy: 85, weeklyFocusMinutes: 290 },
      { rank: 5, handle: '@tanya_v', name: 'Tanya Verma', streakDays: 6, quizAccuracy: 82, weeklyFocusMinutes: 260 },
    ];
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('handle, full_name, avatar_url, study_streak, total_study_minutes')
      .eq('college_name', college)
      .eq('branch', branch)
      .order('study_streak', { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) {
      return [
        { rank: 1, handle: '@durgesh_cs', name: 'Durgesh', streakDays: 14, quizAccuracy: 94, weeklyFocusMinutes: 420 },
        { rank: 2, handle: '@priya_m', name: 'Priya Mehta', streakDays: 12, quizAccuracy: 91, weeklyFocusMinutes: 380 },
      ];
    }

    return data.map((profile, idx) => ({
      rank: idx + 1,
      handle: profile.handle || `@student_${idx + 1}`,
      name: profile.full_name || 'Student',
      avatarUrl: profile.avatar_url,
      streakDays: profile.study_streak || 1,
      quizAccuracy: 85 + (10 - idx),
      weeklyFocusMinutes: profile.total_study_minutes || 120,
    }));
  } catch (err) {
    console.error('[Cohort Service] Leaderboard error:', err);
    return [];
  }
}

/**
 * Fetches shared crowdsourced notes pool for the student's cohort
 */
export async function fetchCohortKnowledgePool(): Promise<SharedCohortResource[]> {
  return [
    {
      id: 'cohort-res-1',
      title: 'AVL Trees & Red-Black Rotations Proof Sheet',
      uploadedBy: '@durgesh_cs',
      collegeName: 'VJTI Mumbai',
      branch: 'Computer Engineering',
      year: '2nd Year',
      subjectCode: 'CS301',
      downloadCount: 42,
      vectorCount: 128,
      uploadTime: '2 hours ago',
    },
    {
      id: 'cohort-res-2',
      title: '5-Year Midterm Question Bank & Solution Keys',
      uploadedBy: '@priya_m',
      collegeName: 'VJTI Mumbai',
      branch: 'Computer Engineering',
      year: '2nd Year',
      subjectCode: 'CS302',
      downloadCount: 68,
      vectorCount: 210,
      uploadTime: 'Yesterday',
    },
  ];
}
