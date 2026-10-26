import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const accessToken = body.accessToken || headerToken;
    const userId = body.userId;

    // 1. If an access token is provided, revoke it via Google OAuth endpoint
    if (accessToken) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(accessToken)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
      } catch (revokeErr) {
        console.warn('[Google Drive Disconnect] Token revocation warning:', revokeErr);
      }
    }

    // 2. Clear user_drive_connections record in Supabase if user ID and DB configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && !supabaseUrl.includes('placeholder') && supabaseKey && userId) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase
          .from('user_drive_connections')
          .update({
            is_connected: false,
            access_token_encrypted: null,
            refresh_token_encrypted: null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      } catch (dbErr) {
        console.warn('[Google Drive Disconnect] DB update notice:', dbErr);
      }
    }

    return NextResponse.json({ success: true, message: 'Google Drive disconnected successfully.' });
  } catch (err: any) {
    console.error('[Google Drive Disconnect Error]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to disconnect Google Drive' },
      { status: 500 }
    );
  }
}
