# EXAM-BUDDY — FEATURE VS. TECH, LANGUAGE, LIBRARIES & ALGORITHMS MAPPING 🛠️

---

## 📌 1. FEATURE-TO-TECH MASTER MAPPING TABLE

Use this table when evaluators ask: *"Which technology, language, library, or algorithm did you use for this specific feature?"*

| Feature Name | Primary Technology | Programming Language | Key Libraries / Packages | Algorithm / Math / Logic Used | Primary Source File |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Student Onboarding & Identity** | Next.js 16 Client Component, Supabase Auth | TypeScript, HTML5 | `lucide-react`, `clsx` | Custom Handle Validation & Student Authentication | [`frontend/src/app/page.tsx`](file:///j:/Vibe-Projects/Exam-Buddy/frontend/src/app/page.tsx) |
| **2. Universal Syllabus Explorer** | Next.js 16 App Router, React 19 | TypeScript | `lucide-react`, `tailwind-merge` | Hierarchical Tree Traversal (Semester $\rightarrow$ Subject $\rightarrow$ Unit) | [`frontend/src/app/subjects/page.tsx`](file:///j:/Vibe-Projects/Exam-Buddy/frontend/src/app/subjects/page.tsx) |
| **3. Document Ingestion & PDF Processing** | Next.js Route Handler, Supabase Storage | TypeScript | `@supabase/supabase-js`, `@supabase/ssr` | **Sliding Window Text Chunking** (500 tokens, 50-overlap), Multimodal OCR | [`frontend/src/app/api/ingest-pdf/route.ts`](file:///j:/Vibe-Projects/Exam-Buddy/frontend/src/app/api/ingest-pdf/route.ts) |
| **4. 4-Scope RAG AI Tutor** | Supabase `pgvector`, Google Gemini API | TypeScript, SQL | `@supabase/supabase-js` | **Cosine Similarity Search**, Dynamic Context Scope Filtering | [`frontend/src/lib/rag-service.ts`](file:///j:/Vibe-Projects/Exam-Buddy/frontend/src/lib/rag-service.ts) |
| **5. Active Recall Flashcards** | React 19, Custom State Engine | TypeScript | `lucide-react`, CSS 3D Transforms | **SuperMemo-2 (SM-2)** Spaced Repetition Algorithm | [`frontend/src/lib/sm2-algorithm.ts`](file:///j:/Vibe-Projects/Exam-Buddy/frontend/src/lib/sm2-algorithm.ts) |
| **6. 1v1 Peer Battle Arena** | React 19 Client State | TypeScript | `lucide-react` | Random Hash Room Code Generator (`BATTLE-CS-XXXX`), Speed Battle Logic | [`frontend/src/app/flashcards/page.tsx`](file:///j:/Vibe-Projects/Exam-Buddy/frontend/src/app/flashcards/page.tsx) |
| **7. PYQ Frequency Analyzer** | Next.js Server Logic | TypeScript | Custom Parser | Keyword Frequency Frequency Recurrence Weighting Algorithm | [`frontend/src/lib/pyq-analyzer.ts`](file:///j:/Vibe-Projects/Exam-Buddy/frontend/src/lib/pyq-analyzer.ts) |
| **8. 5/10-Mark Answer Structurer** | Next.js API Route | TypeScript | Custom Markdown Formatter | University Marking Template Schema Matching (*Definition $\rightarrow$ Diagram $\rightarrow$ Key Points $\rightarrow$ Summary*) | [`frontend/src/lib/exam-structurer.ts`](file:///j:/Vibe-Projects/Exam-Buddy/frontend/src/lib/exam-structurer.ts) |
| **9. Exam Simulator & Quiz Engine** | Next.js API Route, React 19 | TypeScript | Custom Math Utilities | **Negative Marking Calculation** ($Score = C - \frac{W}{4}$), Speed Tracker (sec/q) | [`frontend/src/lib/exam-simulator.ts`](file:///j:/Vibe-Projects/Exam-Buddy/frontend/src/lib/exam-structurer.ts) |
| **10. Mistake Notebook (Error Log)** | Supabase PostgreSQL / LocalStorage | TypeScript | LocalStorage Fallback API | Automated Incorrect Answer Extraction & Revision Queueing | [`frontend/src/lib/storage-service.ts`](file:///j:/Vibe-Projects/Exam-Buddy/frontend/src/lib/storage-service.ts) |
| **11. Multi-Model BYOK Gateway** | Client-Side API Router, Localhost API | TypeScript | Web Crypto API (AES-256) | **Dynamic Fallback & Routing Engine** (OpenAI $\rightarrow$ Claude $\rightarrow$ Gemini $\rightarrow$ Ollama Local) | [`frontend/src/lib/ai-service.ts`](file:///j:/Vibe-Projects/Exam-Buddy/frontend/src/lib/ai-service.ts) |
| **12. Focus Timer & Audio Player** | Web Audio API | TypeScript | `react-use-audio-player` | Pomodoro Interval Timer Logic | [`frontend/src/components/focus/DailyGoalRing.tsx`](file:///j:/Vibe-Projects/Exam-Buddy/frontend/src/components/focus/DailyGoalRing.tsx) |

---

## 🧮 2. ALGORITHMS & MATHEMATICAL FORMULAS EXPLAINED

When evaluators ask: *"Explain the exact algorithm or math behind feature X"*, give these precise technical answers:

### A. SuperMemo-2 (SM-2) Spaced Repetition Algorithm
* **Used in:** Active Recall Flashcards ([`sm2-algorithm.ts`](file:///j:/Vibe-Projects/Exam-Buddy/frontend/src/lib/sm2-algorithm.ts))
* **How it works:**  
  When a student rates a flashcard's recall difficulty ($q \in \{1, 2, 4, 5\}$ corresponding to *Again, Hard, Good, Easy*), the engine updates the **Easiness Factor ($EF$)**:
  $$EF' = \max\left(1.3,\; EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))\right)$$
  The next review interval $I(n)$ in days is assigned as:
  $$I(n) = \begin{cases} 
  1 & \text{for } n = 1 \\ 
  6 & \text{for } n = 2 \\ 
  I(n-1) \times EF' & \text{for } n > 2 
  \end{cases}$$
  If $q < 3$ (*Again*), the repetition count resets to $n = 0$ and interval resets to $I = 1$ day.

---

### B. Vector Embeddings & Cosine Similarity (RAG Engine)
* **Used in:** 4-Scope AI Tutor & Document Upload ([`rag-service.ts`](file:///j:/Vibe-Projects/Exam-Buddy/frontend/src/lib/rag-service.ts))
* **How it works:**  
  1. Uploaded PDFs are parsed into 500-token chunks with 50-token overlap.
  2. Each chunk is passed to `text-embedding-004` to generate a 768-dimensional floating-point vector.
  3. Vectors are stored in Supabase PostgreSQL using the `pgvector` extension.
  4. When a student asks a query, the query vector $A$ is matched against document chunk vectors $B$ using **Cosine Similarity**:
     $$\text{similarity}(A, B) = \frac{A \cdot B}{\|A\| \|B\|} = \frac{\sum_{i=1}^n A_i B_i}{\sqrt{\sum_{i=1}^n A_i^2} \sqrt{\sum_{i=1}^n B_i^2}}$$
  5. The top $K=4$ highest similarity chunks are retrieved and injected into the LLM prompt.

---

### C. Scope Filtering Logic (4-Scope Engine)
* **Used in:** 4-Scope AI Tutor ([`rag-service.ts`](file:///j:/Vibe-Projects/Exam-Buddy/frontend/src/lib/rag-service.ts))
* **How it works:**  
  Retrieval is bounded using SQL filters in PostgreSQL:
  * **Scope 1 (Single Unit):** `WHERE subject_id = X AND unit_id = Y`
  * **Scope 2 (Multi-Unit Merge):** `WHERE subject_id = X AND unit_id IN (Y1, Y2)`
  * **Scope 3 (Full Subject):** `WHERE subject_id = X`
  * **Scope 4 (Global Strategist):** Unrestricted search across all uploaded subject embeddings.

---

### D. PYQ Recurrence Frequency Weighting Algorithm
* **Used in:** Previous Year Question Analyzer ([`pyq-analyzer.ts`](file:///j:/Vibe-Projects/Exam-Buddy/frontend/src/lib/pyq-analyzer.ts))
* **How it works:**  
  Parses 3–5 years of university question papers, extracts repeated concept keywords, and calculates normalized recurrence probability:
  $$P(\text{topic}) = \frac{\text{Occurrences in PYQs}}{\text{Total Question Papers Analyzed}} \times 100\%$$
  - **High Frequency Badge:** $P \ge 70\%$
  - **Medium Frequency Badge:** $40\% \le P < 70\%$
  - **Low Frequency Badge:** $P < 40\%$

---

### E. Multi-Model Fallback & Routing Algorithm
* **Used in:** AI Gateway & Router ([`ai-service.ts`](file:///j:/Vibe-Projects/Exam-Buddy/frontend/src/lib/ai-service.ts))
* **How it works:**  
  ```
  Check User Encrypted API Keys (OpenAI / Claude / Gemini)
       │
       ├── Key Available ──► Execute API Call to Selected Model
       └── No Key / Limit ─► Ping http://localhost:11434 (Local Ollama API)
                                │
                                ├── Ollama Running ──► Route to Local DeepSeek/Llama 3
                                └── Ollama Down    ──► Fall back to Free Gemini API Tier
  ```

---

## 💻 3. SUMMARY CHEAT SHEET FOR EVALUATORS

If evaluators ask you to summarize the technical stack in 15 seconds:

> **"Our tech stack uses Next.js 16 (App Router) with React 19 and TypeScript for the frontend, styled using Tailwind CSS v4 and custom glassmorphism. For data and AI, we use Supabase PostgreSQL with `pgvector` for 768-dimensional vector search, Google Gemini / OpenAI / Ollama for multi-model AI routing, and the SuperMemo-2 (SM-2) mathematical algorithm for active recall flashcards."**
