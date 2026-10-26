import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const oauthError = searchParams.get('error');
  const oauthErrorDescription = searchParams.get('error_description');

  // Prevent open redirect vulnerability: ensure next is an internal relative route
  const rawNext = searchParams.get('next') ?? '/';
  const safeNext = (rawNext.startsWith('/') && !rawNext.startsWith('//')) ? rawNext : '/';

  // Handle provider denial or error cancellation
  if (oauthError) {
    console.warn('[Auth Callback] OAuth provider reported error:', oauthError, oauthErrorDescription);
    const redirectUrl = new URL(safeNext, origin);
    redirectUrl.searchParams.set('auth_error', oauthErrorDescription || oauthError);
    return NextResponse.redirect(redirectUrl.toString());
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('[Auth Callback] Code exchange failed:', error.message);
        const redirectUrl = new URL(safeNext, origin);
        redirectUrl.searchParams.set('auth_error', error.message);
        return NextResponse.redirect(redirectUrl.toString());
      }

      if (data?.session?.user) {
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

        // Upsert Google user profile in public.profiles (safely non-blocking)
        try {
          await supabase.from('profiles').upsert(
            {
              id: user.id,
              full_name: fullName,
              avatar_url: avatarUrl,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );

          // Record login audit event
          await supabase.from('user_logins').insert({
            user_id: user.id,
            email: email,
            provider: user.app_metadata?.provider || 'google',
            user_agent: request.headers.get('user-agent') || 'Browser',
            login_at: new Date().toISOString(),
          });
        } catch (dbErr) {
          // Non-blocking DB log warning: auth session is still valid
          console.warn('[Auth Callback] Database profile sync notice:', dbErr);
        }

        const successRedirect = new URL(safeNext, origin);
        successRedirect.searchParams.set('auth_status', 'success');
        return NextResponse.redirect(successRedirect.toString());
      }
    } catch (err: any) {
      console.error('[Auth Callback Unexpected Error]', err);
      const redirectUrl = new URL(safeNext, origin);
      redirectUrl.searchParams.set('auth_error', err.message || 'auth-failed');
      return NextResponse.redirect(redirectUrl.toString());
    }
  }

  const fallbackRedirect = new URL(safeNext, origin);
  fallbackRedirect.searchParams.set('auth_error', 'no-authorization-code');
  return NextResponse.redirect(fallbackRedirect.toString());
}

