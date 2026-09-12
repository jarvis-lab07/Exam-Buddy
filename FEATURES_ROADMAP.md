# Exam-Buddy — Master Product & Development Roadmap 🚀

This document tracks all planned features, specifications, and architecture modules for **Exam-Buddy**.

---

## 📌 Master Feature List (19 Key Modules)

### 👥 1. Smart Student Profile & Campus Cohorts (The Social & Community Layer)
- [ ] **Unique Student Identity:** Custom student handle (e.g., `@durgesh_cs`) and avatar.
- [ ] **Academic Onboarding Flow:** Captures College Name, Degree, Branch/Department, and Semester/Year.
- [ ] **Smart Campus Cohorts:** Automatically connects students from the *same college, same branch, and same year*.
- [ ] **Crowdsourced Class Knowledge Pool:** When one student uploads verified lecture notes, question banks, or PYQs, classmates in the cohort can access them.
- [ ] **Classroom Exam Sync:** Shared exam countdowns and timetable sync across the batch.
- [ ] **Department Leaderboards:** Real-time ranking of study streaks, quiz accuracy, and weekly focus minutes.

---

### 🤖 2. Intelligent Scoped AI Chat & Multi-Model Router
- [ ] **Hierarchical 4-Scope Chat:**
  - *Scope 1 (Single Unit):* High-precision chat focused on today's lecture notes and immediate class concepts.
  - *Scope 2 (Multi-Unit Merge):* Automatically combines notes from Units 1 & 2 for in-semester unit tests.
  - *Scope 3 (Full Subject Final Exam):* Consolidates all units, question banks, and 5-year PYQs into a master subject tutor.
  - *Scope 4 (Global Academic Strategist):* Cross-subject planning tutor optimizing daily schedules based on weak topics.
- [ ] **Multi-Model Specialty Router:**
  - *Claude 3.5:* Complex Markdown tables, architecture diagrams (Mermaid.js), and clean visual cards.
  - *GPT-4o:* Deep theory, mathematical logic, and step-by-step algorithms.
  - *Local Ollama (DeepSeek/Llama):* Lightweight tasks, quick summaries, and flashcards with zero API cost.
- [ ] **Dynamic Fallback Engine:** Gracefully degrades if the user has 3 keys, 2 keys, 1 key, or 0 keys.
- [ ] **3-Level Structured Explanations:** Instant toggling between *Simple (Beginner)*, *Medium (Conceptual)*, and *Exam-Level (Academic/Formulaic)*.

---

### 📚 3. Document Management & Ingestion
- [ ] **Semester, Subject & Unit Organizer:** Hierarchical syllabus tree with progress indicators.
- [ ] **Upload Center:** Drag & drop support for PDFs, DOCXs, and images up to 20MB.
- [ ] **Multimodal OCR & Vision Extraction:** Transcribes handwritten notes, formulas, and diagrams using Vision AI.
- [ ] **Document-Grounded RAG:** Embeddings with Supabase `pgvector` for context-aware syllabus answers.
- [ ] **Personal Storage Integration (BYOS):** Optional Google Drive connection for personal cloud storage.

---

### 🧠 4. Active Recall, Revision & Testing
- [ ] **AI Flashcard Deck Generator:** Auto-generates front/back cards from uploaded documents.
- [ ] **Scientific Spaced Repetition (FSRS / SM-2):** Adapts card review intervals based on *Again, Hard, Good, Easy* responses.
- [ ] **Adaptive Quiz Generator:** Produces timed multiple-choice (MCQs) and descriptive practice questions.
- [ ] **The "Mistake Notebook" (Error Log):** Auto-saves incorrect quiz answers into a dedicated revision deck with trap explanations.
- [ ] **Peer Quiz Battles:** Shareable 10-question practice test links to compete with classmates.

---

### 🎯 5. Academic & Competitive Exam Specialized Tools
- [ ] **University 5/10-Mark Answer Structurer:** Formats academic answers with: *Definition ➔ Architecture/Diagram ➔ Key Concepts ➔ Pros/Cons*.
- [ ] **PYQ (Previous Year Question) Frequency Analyzer:** Flags high-probability exam topics repeated over the last 3–5 years.
- [ ] **Competitive Exam Simulation Mode:** Real-time countdown clock, speed tracker (seconds/question), and negative marking calculator.
- [ ] **One-Click Unit Formula Sheet:** Printable 1-page PDF summary of all definitions, formulas, and theorems in a unit.

---

### 📊 6. Planning & Learning Analytics
- [ ] **Spaced Repetition Revision Scheduler:** Daily revision prompts following the 1–3–7–15–30 day method.
- [ ] **Visual Analytics Dashboard:** Weekly study minutes bar chart, subject progress rings, and accuracy meters.
- [ ] **Gamified Streaks & Focus Timer:** Daily study streak counter with fire badges and focus minute tracking.
- [ ] **AI Usage & Storage Meter:** Live tracking of AI token consumption and cloud storage quota.

---

### 🔐 7. Security, Settings & BYOK
- [ ] **AI Manager (BYOK - Bring Your Own Keys):** AES-256 encrypted storage for user-supplied OpenAI and Anthropic API keys.
- [ ] **Routing Mode Selector:** One-click toggle between *Local Only (Ollama)*, *Hybrid*, and *Cloud Only*.
- [ ] **Row Level Security (RLS):** Strict isolation of personal student notes, chat histories, and encrypted credentials.
