import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let clientInstance: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (clientInstance) return clientInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
    try {
      clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey) as SupabaseClient;
      return clientInstance;
    } catch (e) {
      console.warn('[Exam-Buddy] Supabase Client initialization warning:', e);
    }
  }

  try {
    // Valid JWT formatted anon key fallback so @supabase/ssr parser never crashes
    clientInstance = createBrowserClient(
      'https://exambuddy-demo.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1idWRkeSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjcwMDAwMDAwLCJleHAiOjIwMTU1NzYwMDB9.placeholder'
    ) as SupabaseClient;
  } catch (e) {
    console.warn('[Exam-Buddy] Supabase fallback client warning:', e);
  }

  return clientInstance!;
}

