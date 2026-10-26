/**
 * Google Drive & Google Picker Service for Exam-Buddy
 * Handles least-privilege OAuth (drive.file scope), Google Picker file selection,
 * secure server-side file listing, and automated RAG document ingestion.
 */

export interface DriveItem {
  id: string;
  name: string;
  mimeType: 'pdf' | 'docx' | 'txt' | 'file';
  rawMimeType?: string;
  size: string;
  sizeBytes?: number;
  modified: string;
  driveUrl: string;
  iconLink?: string;
}

export interface GoogleDriveUploadResult {
  success: boolean;
  fileId?: string;
  driveUrl?: string;
  fileName?: string;
  error?: string;
}

const STORAGE_TOKEN_KEY = 'exambuddy_drive_access_token';
const STORAGE_CONNECTED_KEY = 'exambuddy_drive_connected';

/**
 * Loads Google API and Google Identity Services client scripts dynamically in browser
 */
export async function loadGoogleScripts(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const loadScript = (src: string, id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (document.getElementById(id)) return resolve(true);
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.warn(`[Google Drive] Failed to load external script: ${src}`);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const [gapiLoaded, gsiLoaded] = await Promise.all([
    loadScript('https://apis.google.com/js/api.js', 'gapi-client-script'),
    loadScript('https://accounts.google.com/gsi/client', 'gsi-client-script'),
  ]);

  return gapiLoaded && gsiLoaded;
}

/**
 * Checks if a stored token is available in session/storage
 */
export function getStoredDriveAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_TOKEN_KEY);
}

export function isDriveConnectedInStorage(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_CONNECTED_KEY) === 'true';
}

/**
 * Requests an access token with drive.file scope using Google Identity Services (GIS)
 * Falls back to dev simulation if NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured.
 */
export async function requestDriveAccessToken(): Promise<{
  accessToken: string | null;
  error?: string;
  isSimulated?: boolean;
}> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId || clientId.includes('placeholder')) {
    console.warn(
      '[Google Drive] NEXT_PUBLIC_GOOGLE_CLIENT_ID not configured. Using local development simulation mode.'
    );
    const mockToken = `simulated_drive_token_${Date.now()}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_TOKEN_KEY, mockToken);
      localStorage.setItem(STORAGE_CONNECTED_KEY, 'true');
    }
    return { accessToken: mockToken, isSimulated: true };
  }

  await loadGoogleScripts();

  return new Promise((resolve) => {
    try {
      const google = (window as any).google;
      if (!google?.accounts?.oauth2) {
        return resolve({
          accessToken: null,
          error: 'Google Identity Services script failed to initialize.',
        });
      }

      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (resp: any) => {
          if (resp.error) {
            console.error('[Google Drive Auth Error]', resp);
            return resolve({ accessToken: null, error: resp.error_description || resp.error });
          }
          if (resp.access_token) {
            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_TOKEN_KEY, resp.access_token);
              localStorage.setItem(STORAGE_CONNECTED_KEY, 'true');
            }
            return resolve({ accessToken: resp.access_token });
          }
          return resolve({ accessToken: null, error: 'No access token returned by Google.' });
        },
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err: any) {
      console.error('[Google Drive Auth Exception]', err);
      resolve({ accessToken: null, error: err.message || 'OAuth initialization failed' });
    }
  });
}

/**
 * Opens official Google Picker for files using narrow drive.file scope
 */
export async function openGooglePicker({
  accessToken,
  onSelect,
  onCancel,
}: {
  accessToken: string;
  onSelect: (files: { id: string; name: string; mimeType: string; url: string }[]) => void;
  onCancel?: () => void;
}): Promise<boolean> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!apiKey || !clientId || clientId.includes('placeholder')) {
    // If keys not configured, return false so the UI can use the built-in modal picker
    return false;
  }

  await loadGoogleScripts();

  const gapi = (window as any).gapi;
  const google = (window as any).google;

  if (!gapi || !google?.picker) {
    await new Promise<void>((res) => {
      if (gapi?.load) {
        gapi.load('picker', () => res());
      } else {
        res();
      }
    });
  }

  try {
    const view = new google.picker.DocsView(google.picker.ViewId.DOCS)
      .setMimeTypes(
        'application/pdf,text/plain,application/vnd.google-apps.document,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
      .setMode(google.picker.DocsViewMode.LIST);

    const picker = new google.picker.PickerBuilder()
      .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
      .addView(view)
      .setOAuthToken(accessToken)
      .setDeveloperKey(apiKey)
      .setAppId(clientId)
      .setCallback((data: any) => {
        if (data.action === google.picker.Action.PICKED) {
          const selected = (data.docs || []).map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            mimeType: doc.mimeType,
            url: doc.url || `https://drive.google.com/file/d/${doc.id}/view`,
          }));
          onSelect(selected);
        } else if (data.action === google.picker.Action.CANCEL) {
          if (onCancel) onCancel();
        }
      })
      .build();

    picker.setVisible(true);
    return true;
  } catch (pickerErr) {
    console.warn('[Google Picker] Could not initialize native picker widget:', pickerErr);
    return false;
  }
}

/**
 * Fetches files from Google Drive using our server route
 */
export async function fetchDriveFilesList(
  accessToken: string,
  searchQuery?: string
): Promise<{ files: DriveItem[]; error?: string; expired?: boolean }> {
  // If running with simulated dev token, return offline demo files
  if (accessToken.startsWith('simulated_drive_token_')) {
    const mockFiles: DriveItem[] = [
      {
        id: 'mock-gdrive-1',
        name: 'Computer_Networks_Unit3_Notes.pdf',
        mimeType: 'pdf',
        rawMimeType: 'application/pdf',
        size: '4.2 MB',
        modified: 'Oct 24, 2026',
        driveUrl: 'https://drive.google.com/file/d/mock-1/view',
      },
      {
        id: 'mock-gdrive-2',
        name: 'DBMS_Normalization_Question_Bank.pdf',
        mimeType: 'pdf',
        rawMimeType: 'application/pdf',
        size: '2.8 MB',
        modified: 'Oct 20, 2026',
        driveUrl: 'https://drive.google.com/file/d/mock-2/view',
      },
      {
        id: 'mock-gdrive-3',
        name: 'Algorithms_Lab_Manual_2026.docx',
        mimeType: 'docx',
        rawMimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: '1.5 MB',
        modified: 'Oct 15, 2026',
        driveUrl: 'https://drive.google.com/file/d/mock-3/view',
      },
      {
        id: 'mock-gdrive-4',
        name: 'Operating_Systems_ESE_PYQs.pdf',
        mimeType: 'pdf',
        rawMimeType: 'application/pdf',
        size: '6.1 MB',
        modified: 'Oct 10, 2026',
        driveUrl: 'https://drive.google.com/file/d/mock-4/view',
      },
      {
        id: 'mock-gdrive-5',
        name: 'Theory_of_Computation_Notes.txt',
        mimeType: 'txt',
        rawMimeType: 'text/plain',
        size: '850 KB',
        modified: 'Oct 5, 2026',
        driveUrl: 'https://drive.google.com/file/d/mock-5/view',
      },
    ];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return { files: mockFiles.filter((f) => f.name.toLowerCase().includes(q)) };
    }
    return { files: mockFiles };
  }

  try {
    const res = await fetch('/api/drive/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, query: searchQuery }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { files: [], error: data.error, expired: data.expired };
    }
    return { files: data.files || [] };
  } catch (err: any) {
    return { files: [], error: err.message || 'Failed to communicate with Drive API' };
  }
}

/**
 * Imports a Drive file and processes it through the RAG ingestion pipeline
 */
export async function importGoogleDriveFile({
  fileId,
  fileName,
  mimeType,
  accessToken,
  subjectId,
  unitId,
}: {
  fileId: string;
  fileName: string;
  mimeType: string;
  accessToken: string;
  subjectId?: string;
  unitId?: string;
}): Promise<{ success: boolean; document?: any; error?: string; expired?: boolean }> {
  // If simulated token, generate client-side simulated document
  if (accessToken.startsWith('simulated_drive_token_')) {
    await new Promise((r) => setTimeout(r, 600));
    const docId = `gdrive-${fileId}`;
    const doc = {
      id: docId,
      name: fileName,
      title: fileName.replace(/\.[^/.]+$/, ''),
      size: '3.2 MB',
      fileSize: '3.2 MB',
      subject: subjectId || 'General Knowledge',
      subjectName: 'Computer Networks & Systems',
      subjectCode: 'CS501',
      subjectColor: '#3B82F6',
      fileType: fileName.endsWith('.docx') ? 'doc' : 'pdf',
      category: 'Lecture Notes' as const,
      uploadedAt: 'Just now',
      uploadDate: 'Just now',
      status: 'ready' as const,
      progress: 100,
      pages: 14,
      vectorCount: 210,
      summary: `Imported from Google Drive: ${fileName}. Fully indexed with pgvector.`,
      keyTopics: ['Google Drive BYOS', 'Cloud Material', 'pgvector RAG'],
      driveUrl: `https://drive.google.com/file/d/${fileId}/view`,
      sourceType: 'google_drive' as const,
    };
    return { success: true, document: doc };
  }

  try {
    const res = await fetch('/api/drive/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId,
        fileName,
        mimeType,
        accessToken,
        subjectId,
        unitId,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error, expired: data.expired };
    }
    return { success: true, document: data.document };
  } catch (err: any) {
    return { success: false, error: err.message || 'Import request failed' };
  }
}

/**
 * Disconnects Google Drive connection and revokes credentials
 */
export async function disconnectGoogleDrive(accessToken?: string, userId?: string): Promise<boolean> {
  const token = accessToken || getStoredDriveAccessToken();
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_CONNECTED_KEY);
  }

  if (token) {
    try {
      await fetch('/api/drive/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token, userId }),
      });
    } catch (e) {
      console.warn('[Google Drive Disconnect] Server disconnect notice:', e);
    }
  }

  return true;
}

/**
 * Uploads a file directly to the student's personal Google Drive folder
 */
export async function uploadToStudentGoogleDrive(
  file: File,
  accessToken?: string
): Promise<GoogleDriveUploadResult> {
  const token = accessToken || getStoredDriveAccessToken();
  if (!token || token.startsWith('simulated_drive_token_')) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const mockFileId = `gdrive_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      success: true,
      fileId: mockFileId,
      fileName: file.name,
      driveUrl: `https://drive.google.com/file/d/${mockFileId}/view?usp=sharing`,
    };
  }

  try {
    const metadata = { name: file.name, mimeType: file.type };
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || 'Google Drive upload failed');
    }

    const result = await response.json();
    return {
      success: true,
      fileId: result.id,
      fileName: file.name,
      driveUrl: result.webViewLink,
    };
  } catch (err: any) {
    console.error('[Google Drive BYOS Upload Error]', err);
    return {
      success: false,
      error: err.message || 'Failed to upload to Google Drive',
    };
  }
}
