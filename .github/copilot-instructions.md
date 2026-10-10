# GitHub Copilot Instructions for Exam-Buddy Repository

## Repository Architecture & Codebase Structure
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4.
- **Root Directory vs Frontend Directory:** All application code, components, pages, public assets, and API routes reside inside `frontend/` (`frontend/src/app`, `frontend/src/components`, `frontend/src/lib`).
- **NEVER create a new Next.js starter or run `npx create-next-app` in the root directory.**
- The root directory contains documentation (`SEMESTER_PROJECT_III_LOGBOOK.md`, `README.md`, `TEAM_SETUP.md`) and configuration files.

## Running the Project with Copilot
- To start the development server, run:
  ```bash
  npm --prefix frontend run dev
  ```
  or navigate to `frontend/` before starting:
  ```bash
  cd frontend && npm run dev
  ```
- Dev server URL: `http://localhost:3000`

## Key Pages & Navigation
- `/` - Main Dashboard & Academic Overview (`frontend/src/app/page.tsx`)
- `/subjects` - Universal Syllabus Explorer & PYQ Analyzer (`frontend/src/app/subjects/`)
- `/chat` - 4-Scope RAG AI Tutor (`frontend/src/app/chat/`)
- `/flashcards` - SM-2 Active Recall & 1v1 Peer Battle (`frontend/src/app/flashcards/`)
- `/upload` - Course Document Upload & Vector Indexing (`frontend/src/app/upload/`)
- `/ai-manager` - Multi-Model BYOK Key Gateway (`frontend/src/app/ai-manager/`)
