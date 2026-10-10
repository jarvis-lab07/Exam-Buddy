# EXAM-BUDDY — PROJECT MONITORING & VIVA PRESENTATION GUIDE 🎓

---

## 📌 1. EXECUTIVE ELEVATOR PITCH (30-SECOND OPENING)

> *"Good morning / afternoon Respected Guide and Evaluators.*  
> *Our project is **Exam-Buddy**, an AI-powered adaptive exam preparation and personalized learning platform specifically engineered for university and college engineering students.*  
>  
> *Unlike traditional static LMS platforms like Moodle or unconstrained generic AI tools like standard ChatGPT which often hallucinate, Exam-Buddy unifies **document-grounded RAG (Retrieval-Augmented Generation)**, a **4-Scope context chat engine**, **scientific SuperMemo-2 (SM-2) spaced repetition flashcards**, **PYQ frequency analysis**, and **timed exam simulation** into a single, dark-glassmorphic Next.js 16 application.*  
>  
> *Today, I will walk you through our system architecture, live working features, and technical implementation."*

---

## 🎬 2. STEP-BY-STEP LIVE DEMO SCRIPT (5-MINUTE WALKTHROUGH)

Follow this exact screen sequence during your live presentation:

```
[Screen 1: Landing Dashboard] ──► [Screen 2: Syllabus & PYQ Analyzer]
                                            │
                                            ▼
[Screen 4: 4-Scope RAG AI Chat] ◄── [Screen 3: Document Upload & Indexing]
             │
             ▼
[Screen 5: Active Recall Flashcards] ──► [Screen 6: Exam Simulator & Mistake Notebook]
                                                    │
                                                    ▼
                                    [Screen 7: Multi-Model BYOK Manager]
```

---

### STEP 1: Student Dashboard & Profile (`http://localhost:3000/`)
* **What to Show:**
  * Open the main dashboard. Highlight the dark-glassmorphic UI and show the **Theme Switcher** (ChatGPT Dark, Pro Daylight, Nature Calm).
  * Show the student profile handle (`@durgesh_cs`, B.Tech Computer Engineering, Semester 5).
  * Highlight the **Study Streak Counter (Fire Badges)** and **Focus Minute Progress Rings**.

---

### STEP 2: Course & Universal Syllabus Explorer (`/subjects`)
* **What to Show:**
  * Navigate to `/subjects`. Show the universal **Degree & Semester Switcher** (Engineering, Medicine, Law, Commerce).
  * Expand a subject (e.g., *Operating Systems* or *Database Management Systems*) to reveal the hierarchical unit tree (Unit 1 $\rightarrow$ Unit 5).
  * Click **"PYQ Frequency Radar"** to display past-year question recurrence tags (*High Frequency [70%+], Medium Frequency, Low Frequency*).
  * Show the **"5/10-Mark Answer Structurer"**: demonstrate how raw answers are automatically structured into *Definition $\rightarrow$ Diagram $\rightarrow$ Key Points $\rightarrow$ Summary*.
  * Show embedded **YouTube lecture video player** and **One-Click Unit Formula Sheet Generator**.

---

### STEP 3: Multimodal Document Ingestion & RAG Indexing (`/upload`)
* **What to Show:**
  * Navigate to `/upload`. Drag & drop a sample lecture PDF or handwritten note PDF (up to 20MB).
  * Explain the backend ingestion pipeline: text & formula extraction, 500-token sliding window chunking, and 768-dimensional vector embedding generation stored in Supabase `pgvector`.
  * Highlight the **Google Drive BYOS (Bring Your Own Storage)** integration tile.

---

### STEP 4: 4-Scope RAG AI Tutor & Explanation Depth Controls (`/chat`)
* **What to Show:**
  * Navigate to `/chat`. Show the **4 Scope Selectors**:
    1. **Scope 1 (Single Unit):** Pinpoint chat on today's lecture notes.
    2. **Scope 2 (Multi-Unit Merge):** Combines Units 1 & 2 for unit tests.
    3. **Scope 3 (Full Subject Final Exam):** Consolidates all units, question banks, and 5-year PYQs for final exams.
    4. **Scope 4 (Global Academic Strategist):** Cross-subject daily study planner.
  * Demonstrate the **3-Level Explanation Depth Toggle**: switch between *Simple (Beginner)*, *Medium (Conceptual)*, and *Exam-Level (Formulaic / Academic)*.
  * Type a prompt (e.g., *"Explain Page Replacement Algorithms with diagram"*) to show streaming response generation and rendered Mermaid.js flowcharts.

---

### STEP 5: Active Recall & Spaced Repetition Flashcards (`/flashcards`)
* **What to Show:**
  * Navigate to `/flashcards`. Click an auto-generated deck.
  * Show the **3D card flip animation** revealing front (question) and back (answer).
  * Point out the 4 SuperMemo-2 (SM-2) rating buttons: **Again**, **Hard**, **Good**, **Easy**.
  * Explain that the system mathematically computes the next review interval ($I(n)$) based on the user's recall rating.
  * Show the **"1v1 Peer Quiz Battle Arena"**: click *Generate Room Code* (e.g., `BATTLE-CS-8921`) to show real-time battle room creation.

---

### STEP 6: Exam Simulator & Mistake Notebook (`/components/exam`)
* **What to Show:**
  * Launch a timed 10-question practice test.
  * Point out the live countdown clock, speed tracker (seconds/question), and negative marking calculator.
  * Submit the quiz to view the instant scorecard.
  * Show the **"Mistake Notebook" (Error Log)**: explain how incorrect quiz answers are automatically saved into a dedicated revision deck with trap explanations.

---

### STEP 7: Multi-Model BYOK Gateway & AI Manager (`/ai-manager`)
* **What to Show:**
  * Navigate to `/ai-manager`.
  * Show the AES-256 encrypted Client-Side BYOK manager supporting OpenAI (GPT-4o), Anthropic (Claude 3.5), Google Gemini, and Local Ollama.
  * Explain the fallback routing: if cloud API limits are reached, the platform seamlessly falls back to local Ollama (DeepSeek / Llama 3) with zero API cost.

---

## 🏗️ 3. CORE TECHNICAL ARCHITECTURE SUMMARY

| Layer | Technology Used | Key Technical Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (App Router, Turbopack, React 19) | Server-side rendering, streaming client components |
| **Language & Styling** | TypeScript 5+, Tailwind CSS v4 | Strict type safety, dark-glassmorphism UI system |
| **Database & Vector Search** | Supabase PostgreSQL with `pgvector` & RLS | 768-d vector embeddings, cosine similarity search, isolated student data |
| **Active Recall Algorithm** | SuperMemo-2 (SM-2) Math Engine | Computes $EF'$, $n$, and interval $I(n)$ for flashcards |
| **AI Gateway** | Multi-Model Router | Dynamic fallback across Gemini, OpenAI, Claude & Ollama |

---

## 💡 4. TOP 6 MONITORING & VIVA EVALUATION QUESTIONS (Q&A)

### Q1: How is Exam-Buddy different from generic AI tools like ChatGPT or standard LMS platforms like Moodle?
> **Answer:**  
> *"Generic LMS platforms like Moodle act as static file hosts without interactive AI or active recall tools. Generic AI tools like ChatGPT suffer from hallucination risks and lack syllabus awareness. Exam-Buddy combines document-grounded RAG (restricting AI answers strictly to uploaded course PDFs) with a 4-Scope context engine, SM-2 active recall, PYQ frequency analysis, and university answer structuring."*

### Q2: How do you prevent AI hallucinations in student answers?
> **Answer:**  
> *"We implement Retrieval-Augmented Generation (RAG). Uploaded course PDFs are split into 500-token chunks, converted into 768-dimensional vector embeddings using Google Text-Embedding-004, and stored in Supabase `pgvector`. When a student asks a question, we execute a cosine similarity search (`match_documents`), retrieve top matching chunks, and force the LLM prompt to synthesize answers strictly from those verified document excerpts."*

### Q3: What is the purpose of the 4-Scope Chat Engine?
> **Answer:**  
> *"Students study differently based on exam proximity:  
> • **Scope 1 (Single Unit):** Pinpoint chat for today's lecture notes.  
> • **Scope 2 (Multi-Unit Merge):** Merges Units 1 & 2 for in-semester unit tests.  
> • **Scope 3 (Full Subject Final Exam):** Consolidates all 5 units and 5-year PYQs for final university exams.  
> • **Scope 4 (Global Strategist):** Acts as a cross-subject strategist optimizing daily study schedules."*

### Q4: What is the mathematical foundation of your Spaced Repetition system?
> **Answer:**  
> *"We implemented the SuperMemo-2 (SM-2) algorithm (`sm2-algorithm.ts`). When a student rates card recall ($q \in \{1, 2, 4, 5\}$), the engine updates the Easiness Factor ($EF$) via:  
> $$EF' = \max\left(1.3, EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))\right)$$  
> and schedules the next review interval $I(n) = I(n-1) \times EF'$. This optimizes long-term memory retention."*

### Q5: How do you protect student privacy and manage API costs?
> **Answer:**  
> *"Data security is enforced using PostgreSQL Row Level Security (RLS) policies scoped strictly to authenticated `auth.uid()`. For API costs, we built an AES-256 encrypted BYOK (Bring Your Own Key) manager allowing students to bring their own keys, paired with local Ollama fallback (DeepSeek/Llama 3) for zero-cost offline processing."*

### Q6: What is the current completion state of your project?
> **Answer:**  
> *"The system is 100% functional across all core modules—including syllabus navigation, PDF vector ingestion, 4-scope RAG chat, SM-2 flashcard decks, PYQ frequency analysis, 5/10-mark answer structuring, exam simulation, and multi-model routing. Future work includes expanding real-time WebSockets for peer battles and developing native mobile apps."*

---

## ⚡ 5. PRE-DEMO CHECKLIST (10 MINUTES BEFORE EVALUATION)

- [ ] Open terminal, navigate to `frontend/`, and run `npm run dev`.
- [ ] Open `http://localhost:3000` in Google Chrome and verify the dashboard loads smoothly.
- [ ] Keep 1 sample PDF on your desktop ready for live upload demonstration.
- [ ] Open [`SEMESTER_PROJECT_III_LOGBOOK.md`](file:///j:/Vibe-Projects/Exam-Buddy/SEMESTER_PROJECT_III_LOGBOOK.md) in VSCode as a quick reference document.
- [ ] Keep your phone or secondary tab ready to show responsive mobile layout scaling if requested.

---

**Good luck with your Project Monitoring tomorrow! You have a fully working, state-of-the-art platform! 🚀**
