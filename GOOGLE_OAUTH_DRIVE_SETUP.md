# Exam-Buddy — Google Authentication & Google Drive Integration Guide

This guide details the complete, production-grade configuration for **Google Sign-In / Sign-Up** and **Optional Google Drive (BYOS) Study Material Import** in Exam-Buddy.

---

## 1. Architectural Separation

| Integration | Flow & Provider | Scope Requested | Purpose |
| :--- | :--- | :--- | :--- |
| **Google Sign-In / Sign-Up** | Supabase Auth (PKCE Flow) | `openid`, `email`, `profile` | User registration, authentication, session cookies, and profile metadata. |
| **Google Drive Import (BYOS)** | Google Identity Services (GIS) + Google Picker | `https://www.googleapis.com/auth/drive.file` | Optional, user-initiated file import. Exam-Buddy **only** accesses files explicitly selected by the student. |

> [!IMPORTANT]
> Signing into ExamBuddy with Google **does not** automatically grant access to Google Drive. The Drive connection is completely optional and requests only the narrow `drive.file` scope.

---

## 2. Google Cloud Console Setup

### Step A: Create or Select a Google Cloud Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your organization or create a new project named `ExamBuddy-Production`.

### Step B: Enable Required Google Cloud APIs
Go to **APIs & Services > Library** and enable:
- **Google Drive API** (v3) — Required for streaming file downloads and Google Docs exports.
- **Google Picker API** — Required for the native file selection dialog.

### Step C: Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**.
2. Select **External** user type and click **Create**.
3. **App Information**:
   - App name: `Exam-Buddy`
   - User support email: `your-support@exambuddy.app`
   - Developer contact email: `your-dev@exambuddy.app`
4. **Scopes**:
   - Add standard scopes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`
   - Add Drive scope: `https://www.googleapis.com/auth/drive.file` (Permits read/write only to files opened or created by Exam-Buddy)
5. **Test Users** (while in Testing mode):
   - Add your development and QA Google/Gmail accounts.

### Step D: Create OAuth 2.0 Web Client Credentials
1. Go to **APIs & Services > Credentials > Create Credentials > OAuth client ID**.
2. Choose **Application type**: **Web application**.
3. Name: `Exam-Buddy Web Client`.
4. **Authorized JavaScript origins**:
   - Local: `http://localhost:3000`
   - Production: `https://your-domain.pages.dev` or `https://exambuddy.app`
5. **Authorized redirect URIs**:
   - Local Supabase Callback: `http://localhost:3000/auth/callback`
   - Production Supabase Callback: `https://your-domain.pages.dev/auth/callback`
   - Supabase Hosted Auth URL: `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
6. Click **Create** and securely copy:
   - **Client ID**
   - **Client Secret**

### Step E: Create an API Key for Google Picker
1. In **Credentials**, click **Create Credentials > API key**.
2. Restrict the API key:
   - **API restrictions**: Select only **Google Picker API**.
   - **Application restrictions**: Restrict to your HTTP referrers (`http://localhost:3000/*` and your production domain).

---

## 3. Supabase Google Provider Setup

1. Open your [Supabase Dashboard](https://supabase.com/dashboard/project/_/auth/providers).
2. Go to **Authentication > Providers > Google**.
3. Toggle **Enable Google provider** to ON.
4. Paste your **Client ID** and **Client Secret** obtained from Google Cloud Console.
5. Copy the **Callback URL (for OAuth)** shown in Supabase and ensure it matches the redirect URI added in Step D5 above.
6. Click **Save**.

---

## 4. Database Schema Setup

Run the migrations in `frontend/supabase/schema.sql` (or `supabase/schema.sql`) in your Supabase SQL Editor:
- Enables `vector` extension for pgvector similarity search.
- Creates `public.profiles` for user metadata.
- Creates `public.user_drive_connections` table with Row-Level Security (RLS) policies guaranteeing user isolation.
- Extends `public.documents` with `source_type`, `drive_file_id`, and `drive_web_link`.

---

## 5. Local Development Environment (`.env.local`)

Copy `frontend/.env.example` to `frontend/.env.local`:
```bash
cp frontend/.env.example frontend/.env.local
```

Populate the following variables:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Google Cloud OAuth & Picker
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
NEXT_PUBLIC_GOOGLE_API_KEY=<your-google-picker-api-key>

# AI Embedding Provider
NEXT_PUBLIC_GEMINI_API_KEY=<your-gemini-api-key>
```

> [!NOTE]
> If Google Cloud credentials are omitted during local offline development, Exam-Buddy automatically activates **Development Simulation Mode**, enabling zero-setup UI testing and simulated RAG vectorization.

---

## 6. End-to-End Verification Checklist

- [x] **Google Sign-In**: "Continue with Google" triggers PKCE redirect to Google consent screen.
- [x] **Callback Route**: `/auth/callback` handles code exchange, sanitizes the `next` redirect path against open-redirect vulnerabilities, and upserts user profile.
- [x] **Session Persistence**: Authentication session persists across reloads via secure `@supabase/ssr` cookies.
- [x] **Google Avatar & Badge**: Header displays verified Google profile picture and badge.
- [x] **Drive Connection**: Upload Center (`/upload`) and Student Specs modal provide Google Drive connection actions.
- [x] **Narrow Scope (`drive.file`)**: Only explicitly chosen study materials are accessible.
- [x] **Server-Side File Import**: `/api/drive/import` downloads PDFs, TXT, DOCX, and exports Google Docs to plain text, generating 1536d pgvector embeddings.
- [x] **Disconnection**: Revokes OAuth token and clears connection record.
