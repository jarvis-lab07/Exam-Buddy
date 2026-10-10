# Exam-Buddy — Project Viva & Live Demo Walkthrough Guide 🎓

Welcome to the **Exam-Buddy** Viva Defense & Live Demo Guide. This document provides a step-by-step presentation script, key architectural highlights, and live feature walkthrough flow for evaluators and viva examiners.

---

## 📌 Executive Summary
**Exam-Buddy** is an AI-powered academic operating system for college and university students. It combines **hierarchical RAG context AI chat**, **scientific spaced repetition flashcards**, **campus cohort knowledge sharing**, **BYOK multi-model routing**, and **exam simulation tools** into a unified dark-glassmorphic Next.js 16 Web App.

---

## 🏗️ Core Architecture & Tech Stack

| Layer | Technology Used |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router, Turbopack, React 19) |
| **Language & Styling** | TypeScript 5+, Tailwind CSS v4, Vanilla CSS Design System |
| **Database & Vector Search** | Supabase PostgreSQL with `pgvector` extension & RLS |
| **AI Gateway & Router** | Multi-Model Router (Gemini 1.5/2.0, Claude 3.5, GPT-4o, Ollama Local) |
| **Authentication** | Supabase Auth (Email + Google OAuth) |
| **Document Processing** | Multimodal PDF Ingestion & OCR pipeline |

---

## 🎬 3-Minute Live Viva Demo Script

### Step 1: Student Onboarding & Dashboard (0:00 – 0:45)
- Open `http://localhost:3000` (or live Vercel URL).
- Demonstrate the 3-theme dynamic background switcher (**ChatGPT Dark**, **Pro Daylight**, **Nature Calm**).
- Explain the student identity badge (`@durgesh_cs`, College, Branch, Semester).

### Step 2: Classroom Exam Sync & Universal Syllabus Explorer (0:45 – 1:30)
- Click **"Exam Sync"** in the top header:
  - Highlight live batch countdown timers for upcoming Mid-Sem & Unit Test exams.
  - Demonstrate one-click **"Sync to My Planner"**.
- Navigate to `/subjects`:
  - Show the universal **Degree & Semester Switcher** (Engineering, Medicine, Law, Commerce).
  - Expand hierarchical unit trees and launch **PYQ Frequency Radar** and **5/10-Mark Answer Structurer**.

### Step 3: 4-Scope RAG AI Tutor & Multi-Model Gateway (1:30 – 2:15)
- Navigate to `/chat`:
  - Switch between **Scope 1 (Single Unit)**, **Scope 2 (Multi-Unit Merge)**, **Scope 3 (Full Subject)**, and **Scope 4 (Global Strategist)**.
  - Toggle between **Simple**, **Medium**, and **Exam-Level** explanation depth.
- Show `/ai-manager`:
  - Demonstrate AES-256 BYOK (Bring Your Own Keys) for OpenAI, Anthropic, Gemini, and Local Ollama.

### Step 4: Active Recall, 1v1 Peer Battles & Google Drive BYOS (2:15 – 3:00)
- Navigate to `/flashcards`:
  - Demo 3D flip card animations with FSRS/SM-2 spaced repetition ratings (*Again, Hard, Good, Easy*).
  - Launch **"1v1 Peer Battle Arena"**: generate room code `BATTLE-CS-8921` and simulate real-time speed battle.
- Navigate to `/upload`:
  - Click **"Import from Google Drive (BYOS)"**, select syllabus documents, and demonstrate automatic `pgvector` indexing.

---

## 💡 Viva Defense FAQ (Expected Questions & Answers)

**Q1: How does Exam-Buddy solve hallucination in AI academic responses?**
> *Answer:* Exam-Buddy uses document-grounded RAG (Retrieval-Augmented Generation). Uploaded PDFs are chunked, vectorized using 768-dimensional embeddings via Supabase `pgvector`, and matched using cosine similarity score functions (`match_documents`), forcing the AI to synthesize answers strictly from verified lecture notes.

**Q2: What is the purpose of the 4-Scope Chat Engine?**
> *Answer:* Students study differently based on exam proximity. Scope 1 provides pinpoint answers for today's lecture; Scope 2 merges adjacent units for mid-terms; Scope 3 ingests 5-year PYQs for final exams; Scope 4 acts as a cross-subject strategist optimizing daily study schedules.

**Q3: How is student privacy protected in BYOK mode?**
> *Answer:* User API keys are encrypted using AES-256 in client storage and proxied securely via edge functions. Row Level Security (RLS) policies in PostgreSQL ensure strictly isolated access per authenticated `auth.uid()`.

---

*Exam-Buddy Master Roadmap: 100% Complete & Ready for Presentation! 🚀*
