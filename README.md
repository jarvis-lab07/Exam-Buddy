# 🚀 Exam-Buddy — AI-Powered Academic Co-Pilot & Syllabus Tutor

**Exam-Buddy** is a next-generation academic study application built for university students. It combines **4-Scope RAG Vector Retrieval**, **Multi-Model AI Routing** (Claude, GPT-4o, Gemini, Ollama), **Google Drive BYOS (Bring Your Own Storage)**, **Scientific SM-2 Spaced Repetition**, and **Campus Cohort Knowledge Sharing**.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework:** Next.js 16 (App Router) & React 19
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS v4 + Vanilla Glassmorphism CSS Utilities
- **Iconography:** Lucide React
- **Database & RAG Vector Engine:** Supabase PostgreSQL with `pgvector` extension
- **Storage Engines:** Google Drive BYOS (Zero Cloud Cost) + Supabase Storage Bucket
- **AI Models Supported:** Anthropic Claude 3.5, OpenAI GPT-4o, Google Gemini 3.6 Flash, Groq, and Local Ollama (DeepSeek/Llama 3)

---

## 🌟 Key Features

### 👥 1. Smart Student Profile & Campus Cohorts
- Connects classmates in the same **College, Degree, Branch, and Semester**.
- Crowdsourced Class Knowledge Pool for sharing lecture notes, syllabus decks, and PYQs.
- Weekly department study streak & focus minutes leaderboard.

### 🤖 2. 4-Scope AI Tutor Chat & Multi-Model Router
- **Scope 1 (Unit Focus):** Deep precision Q&A for today's lecture notes or unit.
- **Scope 2 (Multi-Unit):** Combines Units 1 & 2 notes for midterm revision.
- **Scope 3 (Full Subject):** Master course tutor searching across all units & PYQs.
- **Scope 4 (Global Tutor):** Cross-subject academic planner and study scheduler.
- **3 Explanation Levels:** *Simple (Beginner)*, *Medium (Conceptual)*, and *5/10-Mark Exam Standard*.

### 📚 3. Document Ingestion & Google Drive BYOS
- Drag-and-drop dropzone for PDF, DOCX, and PPTX files.
- **100% $0 Cost Storage Architecture:** Saves heavy PDF files directly into the student's personal Google Drive folder (`/Exam-Buddy-Notes/`).
- Overlapping sliding-window text chunking with 1536-dim vector embedding generation.

### 🧠 4. Scientific SM-2 Spaced Repetition & Error Notebook
- 3D interactive flashcard decks with flip animations.
- Implementation of the **SuperMemo-2 (SM-2) algorithm** (*Again, Hard, Good, Easy*).
- Auto-logs quiz mistakes into a dedicated **Mistake Notebook Revision Deck**.

---

## 🚀 Quick Start & Local Installation

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### 2. Installation
```bash
git clone https://github.com/your-username/Exam-Buddy.git
cd Exam-Buddy/frontend
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your credentials:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Database Setup
Run the SQL migration script in [`frontend/supabase/schema.sql`](file:///J:/Vibe-Projects/Exam-Buddy/frontend/supabase/schema.sql) in your Supabase SQL Editor.

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎤 3-Minute Viva Defense & Live Demo Guide

1. **Minute 1: The Problem & Vision**
   - Show the Dashboard (`/`) and explain how Exam-Buddy replaces scattered notes with a unified syllabus tree and focus timer.
2. **Minute 2: The Core AI & Storage Innovation**
   - Demonstrate the **Google Drive BYOS** uploader (`/upload`) showing $0 cloud cost architecture.
   - Switch to **4-Scope AI Tutor Chat** (`/chat`) and show RAG context retrieval and 5/10-mark exam answer formatting.
3. **Minute 3: Spaced Repetition & Campus Cohort**
   - Demonstrate 3D flashcards with **SM-2 interval scheduling** (`/flashcards`).
   - Show the Department Leaderboard & Cohort Knowledge Pool (`/subjects`).