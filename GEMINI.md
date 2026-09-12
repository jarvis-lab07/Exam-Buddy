# Exam-Buddy — Team Antigravity Guidelines

This file is automatically loaded by Antigravity IDE across all devices and team accounts working on this repository.

---

## 1. Project Overview & Tech Stack
- **Project Name:** Exam-Buddy
- **Directory Structure:** All frontend code resides inside `frontend/`
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS v4 + Vanilla CSS utilities
- **UI & Icons:** Lucide React icons, modern glassmorphism, responsive mobile-first layouts

---

## 2. Multi-Device Git Collaboration Protocol
To prevent team members from conflicting or overwriting each other's work:

1. **Never Commit Directly to `main`:**
   - `main` is protected and only updated through reviewed Pull Requests on GitHub.
2. **Feature Branch Convention:**
   - Every member must work in a dedicated branch:
     `feature/<member-name>-<task-name>`
     *(e.g., `feature/durgesh-quiz-timer`, `feature/alex-auth-flow`)*
3. **Daily Sync Before Prompting:**
   - Before prompting Antigravity to build or modify features, always run:
     ```bash
     git checkout main
     git pull origin main
     git checkout feature/<member-name>-<task-name>
     git merge main
     ```
4. **Clean Commits:**
   - Keep commits atomic and descriptive (e.g., `feat: add 30-min countdown timer component`).

---

## 3. Architecture & Code Structure
- **Pages & Routes:** `frontend/src/app/`
- **Reusable UI Components:** `frontend/src/components/` (e.g., `frontend/src/components/ui/`)
- **Types & Interfaces:** `frontend/src/types/`
- **Helper Utilities & Mock Data:** `frontend/src/lib/`
- **Hooks:** `frontend/src/hooks/`

---

## 4. Design & Aesthetics Standard
- Always use modern, vibrant, polished UI (modern typography, subtle gradients, smooth hover states, glassmorphism cards).
- Never use basic, unstyled HTML elements.
- Ensure full mobile and desktop responsiveness.
- Avoid deleting existing teammate components without confirmation.
