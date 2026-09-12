# Exam-Buddy — 1-Month Multi-Tool Engineering Plan 🚀

A comprehensive, 30-day, 4-phase master plan for building **Exam-Buddy** using a collaborative multi-tool stack (**Antigravity + Lovable + Cursor + GitHub Copilot**) across 3 team members and 3 devices.

---

## 🛠️ Multi-Tool Roles & Superpowers

| Tool | Primary User | Primary Responsibility |
| :--- | :--- | :--- |
| **Lovable** | Member 1 (Lead) | Rapid UI layout generation, dark glassmorphic card prototyping, and CSS animation exports. |
| **Antigravity** | All Members | Autonomous agent for terminal operations, Next.js build verification, Supabase migrations, RAG logic, and AI router. |
| **Cursor** | Members 2 & 3 | Fast in-editor Composer refactoring, component logic, and multi-file code editing. |
| **GitHub Copilot** | Members 2 & 3 | Real-time inline code autocompletion. |

---

## 📅 The 4 Phases Overview

- **Phase 1 (Week 1 / Days 1–7):** Design System, Mock Engine & All 7 Screens Interactive (Slides 9–15).
- **Phase 2 (Week 2 / Days 8–14):** Supabase Backend, Auth, PostgreSQL Schema & PDF Ingestion.
- **Phase 3 (Week 3 / Days 15–21):** The Intelligence Layer (4-Scope RAG Chat, Multi-Model Router, Spaced Repetition).
- **Phase 4 (Week 4 / Days 22–30):** Campus Cohorts, Real Syllabus Ingestion, Vercel Deployment & Presentation.

---

## 🔹 Phase 1: Days 1 to 7 — Design System & Interactive Frontend
**Goal:** Build all 7 screens from PPT (Slides 9–15) with pixel-perfect dark glassmorphism on `localhost:3000`.

- **Member 1 (Lead):**
  - Persistent Sidebar layout with live storage & AI gauges (Slide 9).
  - Dashboard page (`/`) with metric cards & study minutes chart (Slide 9).
  - Subjects & Units page (`/subjects`) with progress bars (Slide 10).
  - Student Profile onboarding UI (`@handle`, College, Branch, Year).
- **Member 2:**
  - Upload Center (`/upload`) with drag-and-drop dropzone & file status pills (Slide 11).
  - AI Chat interface (`/chat`) with scope selector & prompt suggestion pills (Slide 12).
- **Member 3:**
  - Study Planner (`/planner`) with calendar view & task creation modal (Slide 13).
  - Flashcards (`/flashcards`) with 3D flip card animations (Slide 14).
  - AI Manager (`/ai-manager`) with BYOK cards & routing toggles (Slide 15).
- **Day 7 Milestone:** All 7 routes clickable; `npm run build` succeeds with zero errors.

---

## 🔹 Phase 2: Days 8 to 14 — Supabase Backend, Auth & Document Processing
**Goal:** User authentication, persistent database, and cloud PDF storage with text extraction.

- **Member 1 (Lead):**
  - Supabase Auth setup (Email + Google OAuth).
  - PostgreSQL tables: `profiles`, `subjects`, `units`, `campus_cohorts` with Row Level Security (RLS).
- **Member 2:**
  - Supabase Storage bucket for study documents (PDF, PNG, JPG).
  - Text extraction pipeline (`pdf-parse` / Vision API for OCR).
  - `pgvector` vector extension setup in Supabase for RAG embeddings.
- **Member 3:**
  - PostgreSQL tables: `flashcard_decks`, `quizzes`, `study_tasks`, `study_logs`.
  - Wire up persistent study streaks and focus time counter.
- **Day 14 Milestone:** Real users can register, create courses, and upload real PDFs to Supabase Storage.

---

## 🔹 Phase 3: Days 15 to 21 — The Intelligence Layer (RAG & Smart Engines)
**Goal:** Live AI chat with 4-level scope, multi-model routing, and spaced repetition flashcards.

- **Member 1 (Lead):**
  - Multi-AI Router: Delegator logic (Claude for visuals/tables, GPT for theory, Ollama for lite tasks).
  - AES-256 encryption for user-supplied API keys (BYOK).
  - 3-Level Explanation Mode (*Simple, Medium, Exam-Level*).
- **Member 2:**
  - 4-Level Scoped Chat Engine (*Unit 1 ➔ Units 1+2 ➔ Full Subject ➔ Global Planner*).
  - RAG similarity search via Supabase `pgvector` (`match_documents`).
- **Member 3:**
  - Scientific Spaced Repetition (SM-2 / FSRS algorithm) for flashcard intervals.
  - Adaptive Quiz generator + "Mistake Notebook" (auto-saved incorrect answers).
- **Day 21 Milestone:** Uploading a PDF enables live Q&A, auto-generated flashcard decks, and scored quizzes.

---

## 🔹 Phase 4: Days 22 to 30 — Campus Cohorts, Syllabus, Live Deployment & Viva
**Goal:** Real college syllabus content, campus cohort sharing, live Vercel deployment, and demo rehearsal.

- **Days 22–24:**
  - Implement Campus Cohort sharing (classmates in same college/branch share notes).
  - Ingest real Semester-III Computer Engineering notes & PYQs (e.g. *Advanced Algorithms*, *Java*).
  - Classroom Leaderboard (streaks & quiz accuracy).
- **Days 25–26:**
  - Deploy frontend to **Vercel** with custom production URL.
  - Test responsive mobile viewports (phones & tablets).
- **Days 27–28:**
  - Full security and RLS audit.
  - Final compile verification (`npm run build`).
- **Days 29–30:**
  - Update PPT presentation slides with real screenshots of the live app.
  - 3-minute live demo rehearsal.
  - Viva defense preparation.
