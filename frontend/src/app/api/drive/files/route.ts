import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const SUPPORTED_MIME_QUERY = [
  "mimeType = 'application/pdf'",
  "mimeType = 'text/plain'",
  "mimeType = 'application/vnd.google-apps.document'",
  "mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'",
  "mimeType = 'application/msword'",
].join(' or ');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const accessToken = body.accessToken || headerToken;
    const searchQuery = body.query?.trim() || '';

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing Google Drive access token. Please connect your Google account.' },
        { status: 401 }
      );
    }

    // Construct query: not trashed AND matches supported mime types
    let q = `trashed = false and (${SUPPORTED_MIME_QUERY})`;
    if (searchQuery) {
      // Escape single quotes in search query
      const safeQuery = searchQuery.replace(/'/g, "\\'");
      q += ` and name contains '${safeQuery}'`;
    }

    const driveUrl = new URL('https://www.googleapis.com/drive/v3/files');
    driveUrl.searchParams.set('q', q);
    driveUrl.searchParams.set('fields', 'files(id, name, mimeType, size, modifiedTime, webViewLink, iconLink)');
    driveUrl.searchParams.set('pageSize', '50');
    driveUrl.searchParams.set('orderBy', 'modifiedTime desc');

    const res = await fetch(driveUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (res.status === 401) {
      return NextResponse.json(
        { error: 'Google Drive authorization expired or revoked. Please reconnect.', expired: true },
        { status: 401 }
      );
    }

    if (res.status === 403) {
      const errJson = await res.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errJson.error?.message || 'Access to Google Drive files was denied. Check permissions.',
          denied: true,
        },
        { status: 403 }
      );
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errJson.error?.message || `Google Drive API error: ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const files = (data.files || []).map((f: any) => {
      let friendlyType = 'file';
      if (f.mimeType === 'application/pdf') friendlyType = 'pdf';
      else if (f.mimeType === 'text/plain') friendlyType = 'txt';
      else if (f.mimeType.includes('document')) friendlyType = 'docx';

      const sizeBytes = parseInt(f.size || '0', 10);
      const friendlySize = sizeBytes > 0
        ? sizeBytes > 1024 * 1024
          ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(sizeBytes / 1024)} KB`
        : f.mimeType === 'application/vnd.google-apps.document'
        ? 'Google Doc'
        : 'Unknown';

      const modifiedDate = f.modifiedTime
        ? new Date(f.modifiedTime).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : 'Recently';

      return {
        id: f.id,
        name: f.name,
        mimeType: friendlyType,
        rawMimeType: f.mimeType,
        size: friendlySize,
        sizeBytes,
        modified: modifiedDate,
        driveUrl: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
        iconLink: f.iconLink,
      };
    });

    return NextResponse.json({ files, count: files.length });
  } catch (err: any) {
    console.error('[Google Drive Files API Error]', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error browsing Google Drive' },
      { status: 500 }
    );
  }
}
