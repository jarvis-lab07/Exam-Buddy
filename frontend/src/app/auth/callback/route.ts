import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.session?.user) {
        const user = data.session.user;
        const email = user.email || '';
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          email.split('@')[0] ||
          'Google Student';
        const avatarUrl =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          null;

        // Upsert Google user profile in DB
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            full_name: fullName,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

        // Record real login event in database audit table
        await supabase.from('user_logins').insert({
          user_id: user.id,
          email: email,
          provider: user.app_metadata?.provider || 'google',
          user_agent: request.headers.get('user-agent') || 'Browser',
          login_at: new Date().toISOString(),
        });

        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (err) {
      console.error('[Auth Callback Error]', err);
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth-failed`);
}
