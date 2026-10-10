# SEMESTER PROJECT-III LOG BOOK

---

## WEEK 1 LOG ENTRY

**SEMESTER PROJECT-III**  
**Academic Year:** 2026–27 SEM-I  
**Week/Date:** 29-08-2026  
**Activity:** Section 1 — Introduction  

---

### 1. INTRODUCTION

#### 1.1 Background
In contemporary higher education, particularly within B.Tech Computer Engineering curricula, undergraduate students face an increasingly complex academic environment. Students must balance core theoretical subjects (such as Data Structures & Algorithms, Operating Systems, Database Management Systems, and Computer Networks) with rigorous practical assignments, laboratory sessions, mid-semester evaluations, and final university examinations. 

Traditional learning approaches heavily rely on static lecture notes, physical reference textbooks, unorganized digital PDFs, and scattered previous-year question (PYQ) papers. This fragmentation poses significant challenges:
1. **Resource Fragmentation:** Course content is distributed across multiple learning management systems, personal cloud storage, local file systems, and physical notebooks, resulting in substantial time lost searching for specific study materials.
2. **One-Size-Fits-All Pace:** Standard classroom lectures proceed at a uniform pace that cannot accommodate individual learning speeds or target specific conceptual gaps.
3. **Ineffective Revision Strategies:** Passive re-reading of textbooks and cramming immediately prior to examinations fail to produce long-term knowledge retention.
4. **Lack of Instant Academic Guidance:** Students often experience bottlenecks outside lecture hours when attempting to clarify complex formulas, pseudocode implementations, or theoretical proofs.

Recent advancements in Artificial Intelligence (AI), specifically Large Language Models (LLMs) and Retrieval-Augmented Generation (RAG), present an opportunity to address these challenges. By grounding generative AI models on syllabus-specific course documents and incorporating scientific cognitive strategies—such as active recall and spaced repetition—modern software engineering can deliver adaptive, highly targeted academic platforms.

---

#### 1.2 Project Overview
**Exam-Buddy** is an AI-powered adaptive exam preparation and personalized learning platform specifically engineered for college and university engineering students. The platform functions as a centralized academic operating system that synthesizes syllabus management, multimodal document ingestion, context-aware AI tutoring, scientific flashcard revision, previous-year question (PYQ) frequency analysis, and real-time exam simulation into a cohesive, responsive web interface.

Built on Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4, Exam-Buddy operates alongside a Supabase PostgreSQL backend equipped with the `pgvector` extension. The system enables students to upload lecture slides, PDF textbooks, and handwritten notes, which are automatically indexed into high-dimensional vector space. Students can subsequently interact with a specialized 4-Scope RAG AI Engine that adapts its responses according to the student's study context—ranging from a single lecture unit to cross-subject semester planning.

---

#### 1.3 Motivation
The primary motivation for developing Exam-Buddy stems from observing the persistent divide between passive content consumption and active, outcome-driven exam preparation. While generic AI chat assistants (e.g., standard ChatGPT or Claude interfaces) have become widely accessible, their generalist nature presents notable drawbacks in academic settings:
* **Hallucination Risk:** General-purpose AI models may invent facts, incorrect mathematical derivations, or outdated API specifications not supported by the university syllabus.
* **Context Blindness:** Standard chatbots lack awareness of specific semester boundaries, unit weightages, or past university question patterns.
* **Absence of Pedagogical Workflows:** Passive text generation does not automatically produce structured study aids, such as spaced repetition flashcards, university-style 5-mark and 10-mark structured answers, or timed practice exams.

Exam-Buddy addresses these issues by engineering an academic workspace where AI is explicitly constrained to verified syllabus documents, supported by scientific revision algorithms (SuperMemo-2 / FSRS) and custom multi-model routing capabilities.

---

#### 1.4 Project Objectives
The core technical and functional objectives of Exam-Buddy include:

1. **Centralized Syllabus & Resource Management:** Construct a hierarchical unit-wise syllabus tree (Semester $\rightarrow$ Subject $\rightarrow$ Unit $\rightarrow$ Topic) enabling intuitive navigation and progress tracking.
2. **Multimodal Document Processing:** Implement an ingestion pipeline capable of extracting text and mathematical formulas from uploaded PDFs, lecture slides, and notes for vector storage.
3. **Document-Grounded RAG Architecture:** Deploy a Retrieval-Augmented Generation pipeline using vector embeddings and cosine similarity search to deliver hallucination-free academic responses.
4. **Hierarchical 4-Scope AI Tutor:** Develop a contextual chat system supporting single-unit precision queries, multi-unit test preparation, subject-wide final exam synthesis, and cross-subject academic planning.
5. **Multi-Model Router & BYOK Architecture:** Establish a secure client-side Bring Your Own Key (BYOK) manager supporting OpenAI, Anthropic, Google Gemini, and local Ollama models with automatic fallback.
6. **Scientific Active Recall & Spaced Repetition:** Implement the SuperMemo-2 (SM-2) algorithm to automate flashcard deck generation and calculate optimal review intervals based on student recall ratings.
7. **PYQ Frequency Analyzer & Answer Structurer:** Build tools to analyze historical question recurrence and automatically format answers into standard academic structures (*Definition $\rightarrow$ Diagram $\rightarrow$ Key Points $\rightarrow$ Summary*).
8. **Exam Simulation Engine:** Design a timed quiz interface supporting negative marking calculation, speed tracking, and automated incorrect answer extraction into an error log notebook.
9. **Campus Cohort Integration:** Enable shared access to uploaded class resources, batch countdown timers, and department study streak leaderboards.

---

#### 1.5 Scope of the Project
The scope of Exam-Buddy covers:
* **Target Audience:** Undergraduate college students, primarily across B.Tech Computer Engineering, Information Technology, and allied disciplines, with extendable course templates for other academic branches.
* **Functional Boundaries:** Single-user personalized dashboard, syllabus organization, PDF document ingestion, RAG vector chat, multi-model AI routing, flashcard generation, quiz simulation, analytics tracking, and cohort resource sharing.
* **Technical Boundaries:** Web-based responsive client application (desktop and mobile web viewports), local browser storage fallback, client-side AES-256 key encryption, and cloud vector database synchronization.

---

#### 1.6 Target Users
1. **Undergraduate Students:** Students seeking structured, syllabus-aligned preparation for unit tests, mid-semester evaluations, and final university examinations.
2. **Study Groups & Class Cohorts:** Student peer groups who benefit from shared notes, standardized batch timetables, and competitive quiz reviews.
3. **Self-Paced Learners:** Students requiring variable explanation depths (Simple, Medium, Exam-Level) to master complex technical concepts.

---

#### 1.7 Proposed Solution
Exam-Buddy addresses the limitations of traditional study methods through an integrated web application:

```
[Student Interface] 
       │
       ├──► Syllabus & Course Navigator (Hierarchical Units)
       ├──► Multimodal PDF Upload ──► Vector Indexing (pgvector)
       ├──► 4-Scope RAG AI Engine (Unit / Multi-Unit / Subject / Global)
       ├──► Active Recall Hub (SM-2 Spaced Repetition Flashcards)
       ├──► Exam Simulator (Timed Quizzes + Error Log Notebook)
       └──► Analytics Dashboard (Study Streaks + Topic Mastery)
```

The system combines document-grounded context retrieval with cognitive learning techniques, providing an end-to-end environment that guides students from initial document upload through final revision.

---

#### 1.8 Technologies Used
The technologies incorporated into the existing codebase comprise:
* **Frontend Framework:** Next.js 16.2.10 (App Router, Turbopack, React 19)
* **Programming Language:** TypeScript 5+
* **Styling & UI Components:** Tailwind CSS v4, Vanilla CSS Custom Design System, Lucide React Icons (`lucide-react` v1.45.0), Audio Playback Integration (`react-use-audio-player` v4.0.2)
* **Utility Libraries:** `clsx`, `tailwind-merge`
* **Database & Vector Search:** Supabase PostgreSQL (`@supabase/supabase-js` v2.117.2, `@supabase/ssr` v0.12.7) with `pgvector` extension and Row Level Security (RLS)
* **AI & LLM Services:** Google Gemini API (Gemini 1.5 / 2.0 Flash & Pro), OpenAI API (GPT-4o), Anthropic API (Claude 3.5 Sonnet), and Local Ollama API (DeepSeek / Llama 3)
* **Authentication:** Supabase Auth (Email/Password & Google OAuth) with custom daily landmark visual verification

---

#### 1.9 Expected Contribution
Exam-Buddy provides a practical software framework demonstrating how modern artificial intelligence, vector database architectures, and cognitive learning theories can be integrated into higher education. By combining syllabus-grounded AI interaction with automated active recall and performance analytics, the project offers a functional model for personalized, outcome-driven learning platforms.

---

**Guide Signature:** __________________  
**Coordinator Signature:** __________________

---

## WEEK 2 LOG ENTRY

**SEMESTER PROJECT-III**  
**Academic Year:** 2026–27 SEM-I  
**Week/Date:** 19-09-2026  
**Activity:** Section 2 — Literature Survey  

---

### 2. LITERATURE SURVEY

#### 2.1 Survey of Existing Approaches and Systems
To establish the theoretical and practical context for Exam-Buddy, a literature survey was conducted across existing learning management systems, online exam platforms, adaptive learning software, and AI-assisted educational tools.

##### A. Traditional Learning Management Systems (LMS)
* **Existing Approach:** Systems such as Moodle, Canvas, and Blackboard serve as centralized repositories for instructors to upload lecture slides, syllabi, and assignment submission portals.
* **Main Features:** Course content distribution, gradebooks, assignment submission forms, and discussion forums.
* **Advantages:** High institutional stability, structured administrative workflows, and broad academic adoption.
* **Limitations:** LMS platforms function primarily as static file storage. They lack interactive AI tutoring, automated document indexing, personalized study path generation, and real-time active recall tools.
* **Relevance:** Highlights the necessity for a student-centric platform that transforms static course files into dynamic, queryable learning assets.

##### B. Standard Generative AI Assistants
* **Existing Approach:** General-purpose conversational interfaces such as OpenAI ChatGPT, Google Gemini web interface, and Anthropic Claude.
* **Main Features:** General knowledge answering, code generation, translation, and summarization across unconstrained domains.
* **Advantages:** Broad reasoning capabilities, high natural language fluency, and instant response generation.
* **Limitations:** High susceptibility to hallucination when queried on specific university curricula, absence of document-grounded boundaries, lack of syllabus scope filtering, and inability to natively track spaced repetition intervals.
* **Relevance:** Demonstrates the requirement for a Retrieval-Augmented Generation (RAG) architecture that constrains model outputs strictly to uploaded, verified course materials.

##### C. Digital Flashcard & Spaced Repetition Systems
* **Existing Approach:** Standalone flashcard applications such as Anki and Quizlet.
* **Main Features:** Manual flashcard deck creation, basic active recall interfaces, and spaced repetition scheduling algorithms (e.g., SuperMemo SM-2, Leitner system).
* **Advantages:** Scientifically proven to enhance long-term memory retention and reduce forgetting curves.
* **Limitations:** Manual card creation requires significant time effort from students. Traditional platforms lack automated extraction of questions from complex PDF textbook chapters or handwritten lecture notes.
* **Relevance:** Confirms the value of incorporating the SM-2 algorithm directly into Exam-Buddy while automating card generation using LLM document parsing.

##### D. Online Testing & Question Bank Platforms
* **Existing Approach:** Specialized test preparation applications (e.g., IndiaBIX, Sanfoundry, GeeksforGeeks practice portals).
* **Main Features:** Fixed multiple-choice question (MCQ) banks, categorized by topic or subject.
* **Advantages:** Provides standardized practice questions for generic competitive exams.
* **Limitations:** Content is static and generic; questions are not aligned with a specific university department's internal syllabus or specific professor lecture notes. They lack personalized error tracking and dynamic difficulty adjustment.
* **Relevance:** Indicates the need for an adaptive exam simulation engine that extracts practice questions directly from student-uploaded course materials and previous-year question (PYQ) documents.

---

#### 2.2 Comparative Analysis Table

| Sr. No. | System Category | Representative Examples | Key Features | Major Limitations | Relevance to Exam-Buddy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Institutional LMS | Moodle, Canvas | Content delivery, grade tracking, assignment portals | Static file host; no AI guidance or active recall tools | Exam-Buddy replaces static file hosting with interactive vector search |
| 2 | Generalist AI Chat | ChatGPT, Claude | High-level natural language generation | Hallucinations; zero syllabus grounding; no revision engine | Exam-Buddy enforces RAG boundaries and syllabus scoping |
| 3 | Spaced Repetition Apps | Anki, Quizlet | SM-2 algorithm, flashcard scheduling | Requires tedious manual card creation; no RAG integration | Exam-Buddy automates deck creation via document parsing |
| 4 | Static Question Banks | Sanfoundry, IndiaBIX | Fixed topic-wise MCQ lists | Generic content; unaligned with university exam patterns | Exam-Buddy generates custom quizzes from uploaded PYQs |
| **5** | **Proposed System** | **Exam-Buddy** | **RAG 4-Scope AI, SM-2 Spaced Flashcards, PYQ Analyzer, Multi-Model Router** | **Requires initial PDF upload for optimal grounding** | **Integrated academic platform for engineering students** |

---

#### 2.3 Identified Research & Development Gap
The survey reveals a distinct gap in existing educational software solutions:

```
[Existing Landscape]
  ├─ Static LMS (File Storage Only)
  ├─ Generalist AI (Unrestricted / Hallucination-Prone)
  ├─ Manual Flashcards (High Effort)
  └─ Generic Question Banks (Not Syllabus-Aligned)
                     │
                     ▼
            [IDENTIFIED GAP]
  Lack of a unified platform that combines:
  1. Syllabus-Grounded RAG (Zero Hallucination)
  2. Hierarchical Context Scoping (Unit -> Subject -> Global)
  3. Automated Active Recall & SM-2 Spaced Repetition
  4. University-Specific PYQ Pattern Structuring
                     │
                     ▼
            [EXAM-BUDDY PLATFORM]
```

Existing solutions force students to context-switch across disconnected applications—using an LMS to download files, a general chatbot to ask questions, a flashcard app for revision, and external websites for practice tests. Exam-Buddy eliminates this friction by unifying document ingestion, vector-grounded RAG tutoring, SM-2 active recall, PYQ answer structuring, and performance analytics within a single system.

---

**Guide Signature:** __________________  
**Coordinator Signature:** __________________

---

## WEEK 3 LOG ENTRY

**SEMESTER PROJECT-III**  
**Academic Year:** 2026–27 SEM-I  
**Week/Date:** 26-09-2026  
**Activity:** Section 3 — Problem Statement & Requirements  

---

### 3. PROBLEM STATEMENT AND REQUIREMENTS

#### 3.1 Existing Problem
Undergraduate engineering students frequently experience academic burnout, fragmented study habits, and sub-optimal examination performance due to structural inefficiencies in how study materials are managed and revised. Specific problems identified include:

1. **Unstructured Resource Management:** Course materials—including lecture slides, handwritten lab notes, reference PDFs, and past question papers—are scattered across local downloads, messaging groups, and cloud folders, leading to disorganization.
2. **Inability to Assess Topic Recurrence:** Students struggle to identify which topics within a 5-unit syllabus carry high probability in university examinations versus low-weightage electives.
3. **Inefficient Study Scope Adjustment:** Prior to daily lectures, students require micro-explanations of a single unit; prior to mid-semester exams, they require multi-unit synthesis; prior to final exams, they require full-subject mastery. Existing tools do not support variable context scoping.
4. **Passive Revision Deficit:** Most students rely on passive re-reading, which yields rapid knowledge decay. Creating active recall tools (flashcards and practice quizzes) manually is time-prohibitive during high-pressure exam weeks.
5. **AI Reliability Concerns:** Unconstrained AI tools frequently output plausible but inaccurate information, misguiding students during technical revision.

---

#### 3.2 Formal Problem Statement
> *"To design and implement a web-based, AI-powered adaptive exam preparation and personalized learning platform that integrates syllabus-grounded Retrieval-Augmented Generation (RAG), hierarchical context scoping, automated SuperMemo-2 (SM-2) spaced repetition flashcard generation, previous-year question (PYQ) pattern analysis, multi-model AI routing, and real-time exam simulation, thereby providing undergraduate students with an end-to-end environment for academic preparation and retention."*

---

#### 3.3 Existing Workflows vs. Proposed Platform Workflow

```
TRADITIONAL WORKFLOW:
Download PDF ──► Search Folders ──► Copy to General AI ──► Manual Flashcard Entry ──► Un-timed Self Test
(High Friction, Fragmented, Hallucination-Prone)

EXAM-BUDDY WORKFLOW:
Upload PDF ──► Vector Indexing ──► 4-Scope RAG Chat ──► Auto SM-2 Flashcards ──► Timed Quiz + Error Log
(Unified, Document-Grounded, Scientifically Scheduled)
```

---

#### 3.4 Limitations of the Existing Workflow
1. **High Time Overhead:** Excessive time spent organizing notes instead of learning.
2. **Context Switching:** Loss of concentration due to navigating multiple tools.
3. **No Syllabus Grounding:** High risk of AI hallucinations leading to incorrect study information.
4. **Lack of Spaced Repetition Automation:** Irregular revision schedules leading to rapid forgetting.
5. **No Exam Answer Formatting:** Inability of standard tools to format answers according to university grading standards (*Definition, Diagram, Key Points, Summary*).
6. **No Automated Error Tracking:** Mistaken quiz answers are lost rather than collected for focused review.
7. **Single-Model Dependency:** Over-reliance on a single AI provider, leading to service disruption if rate limits or outages occur.

---

#### 3.5 Key System Requirements

##### A. Functional Requirements
* **FR-1 Student Identity & Security:** The system shall maintain unique student handles (`@handle`), academic details (Degree, Department, Semester), and student authentication.
* **FR-2 Course & Syllabus Hierarchy:** The system shall support a structured syllabus tree (Semester $\rightarrow$ Subject $\rightarrow$ Unit $\rightarrow$ Topic) with progress indicators.
* **FR-3 Multimodal PDF Ingestion & OCR:** The system shall parse uploaded PDF documents, extract text and equations, and generate vector embeddings stored in Supabase `pgvector`.
* **FR-4 Hierarchical 4-Scope RAG Engine:** The system shall enable conversational AI interactions bounded by four distinct retrieval scopes:
  * *Scope 1 (Single Unit)*
  * *Scope 2 (Multi-Unit Merge)*
  * *Scope 3 (Full Subject Final Exam)*
  * *Scope 4 (Global Academic Strategist)*
* **FR-5 Multi-Model AI Router & BYOK:** The system shall allow users to supply AES-256 encrypted API keys (OpenAI, Anthropic, Gemini) or utilize local Ollama instances with automated fallback.
* **FR-6 Active Recall & SM-2 Spaced Repetition:** The system shall generate flashcard decks from documents and schedule reviews using the SuperMemo-2 algorithm.
* **FR-7 PYQ Frequency Analyzer & Answer Structurer:** The system shall analyze question recurrence across historical exam papers and output structured answers matching university marking schemes.
* **FR-8 Exam Simulation & Error Log:** The system shall execute timed multiple-choice practice tests with speed tracking, negative marking, and automatic extraction of incorrect responses into a dedicated Mistake Notebook.
* **FR-9 Campus Cohorts & Timetable Sync:** The system shall support cohort-based file sharing, batch exam countdown timers, and focus streak leaderboards.

##### B. Non-Functional Requirements
* **NFR-1 Usability & Interface Design:** The platform shall utilize a responsive dark-glassmorphism theme with accessible typography, micro-animations, and dynamic background options.
* **NFR-2 Performance & Response Time:** Vector similarity search and prompt assembly shall execute under 500ms; streaming AI responses shall begin rendering within 1.5 seconds under standard broadband conditions.
* **NFR-3 Data Security & Isolation:** User data, API keys, and notes shall be isolated using PostgreSQL Row Level Security (RLS) policies scoped to `auth.uid()`.
* **NFR-4 Scalability & Reliability:** The server architecture shall handle client storage fallback gracefully when backend database connection parameters are absent.
* **NFR-5 Maintainability:** The application code shall adhere to modular TypeScript patterns with strict type safety across Next.js App Router endpoints.

---

**Guide Signature:** __________________  
**Coordinator Signature:** __________________

---

## WEEK 4 LOG ENTRY

**SEMESTER PROJECT-III**  
**Academic Year:** 2026–27 SEM-I  
**Week/Date:** 10-10-2026  
**Activity:** Section 4 — Implementation Details  

---

### 4. IMPLEMENTATION DETAILS

#### 4.1 Overall System Architecture
Exam-Buddy is implemented following a decoupled, client-server web architecture leveraging Next.js 16 App Router for full-stack API endpoint rendering and React 19 client components for interactive UI management.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|  Next.js 16 React 19 UI (Tailwind CSS v4 + Dark Glassmorphism)                     |
|  - Dashboard / Analytics      - 4-Scope RAG Chat        - Flashcards (SM-2)      |
|  - Syllabus Explorer          - Exam Simulator          - AI Manager (BYOK)      |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                                SERVER / API LAYER                                 |
|  Next.js 16 Route Handlers (Edge & Node.js Runtime)                               |
|  - /api/ai-stream        - /api/ingest-pdf       - /api/generate-quiz            |
|  - /api/ollama           - Multi-Model Router    - RAG Context Assembler         |
+-------------------+----------------------+-------------------+--------------------+
                    |                      |                   |
                    v                      v                   v
+-----------------------+  +-----------------------+  +-----------------------------+
|    SUPABASE DATABASE  |  |    AI MODEL SERVICES  |  |    LOCAL / FALLBACK ENGINE  |
|  - PostgreSQL DB      |  |  - Google Gemini      |  |  - Local Ollama (DeepSeek)  |
|  - pgvector (768-d)   |  |  - OpenAI GPT-4o      |  |  - Browser LocalStorage     |
|  - Row Level Security |  |  - Anthropic Claude   |  |  - SM-2 Math Scheduler      |
+-----------------------+  +-----------------------+  +-----------------------------+
```

---

#### 4.2 Implemented Technology Stack

| Layer | Technology | Version / Specification | Purpose in Exam-Buddy |
| :--- | :--- | :--- | :--- |
| **Frontend Core** | Next.js | 16.2.10 (App Router, Turbopack) | Server-side rendering, routing, API route hosting |
| **UI Library** | React | 19.2.4 | Component-based interactive UI state management |
| **Type Safety** | TypeScript | 5.0+ | Strict type checking across components, APIs, and schemas |
| **Styling** | Tailwind CSS | v4.0 with Custom CSS System | Dark-glassmorphic layouts, dynamic theme transitions |
| **Iconography & Audio** | Lucide React / Audio Player | `lucide-react` 1.45.0 / `react-use-audio-player` 4.0.2 | Visual interface icons and focus sound effects |
| **Database & Vector** | Supabase PostgreSQL | `pgvector` extension enabled | Document storage, user authentication, 768-d vector search |
| **AI Gateway** | Multi-Model Router | Custom TypeScript Gateway | Dynamic routing between Gemini, OpenAI, Claude, and Ollama |
| **Revision Algorithm**| SuperMemo-2 (SM-2) | Custom Math Engine (`sm2-algorithm.ts`)| Active recall flashcard scheduling based on user feedback |

---

#### 4.3 Key Frontend Pages & Component Modules
The frontend application structure located in `frontend/src/app` and `frontend/src/components` includes the following functional modules:

1. **Dashboard & Overview (`/src/app/page.tsx`):** Displays student profile stats (`@handle`, department, semester), daily study streak fire badges, focus minute progress rings, upcoming exam countdown cards, and quick action tiles.
2. **Hierarchical Syllabus Explorer (`/src/app/subjects/`):** Renders interactive course cards organized by units. Enables degree/semester toggling, unit expanding, YouTube video lecture embedding, and one-click formula sheet generation.
3. **4-Scope RAG AI Chat (`/src/app/chat/`):** Provides a conversational chat view with scope selectors (Unit, Multi-Unit, Subject, Global), explanation depth controls (Simple, Medium, Exam-Level), streaming response display, and Mermaid.js diagram rendering.
4. **Active Recall Flashcard Hub (`/src/app/flashcards/`):** Features 3D card flip animations, rating buttons (*Again, Hard, Good, Easy*), deck creation controls, and a 1v1 Peer Quiz Battle room generator.
5. **Document Ingestion & Upload (`/src/app/upload/`):** Drag-and-drop zone for uploading course PDFs up to 20MB, Google Drive BYOS cloud selector, and embedding status indicators.
6. **AI Manager & BYOK Manager (`/src/app/ai-manager/`):** Form interface for entering user-owned API keys (OpenAI, Anthropic, Gemini) with client-side encryption controls and Ollama local host configuration.
7. **Exam Simulator & Quiz Engine (`/src/components/exam/`):** Timed evaluation interface featuring question step counters, countdown timers, speed calculation, negative marking options, and automated incorrect answer logging.

---

#### 4.4 RAG Engine & Vector Embedding Pipeline
The Retrieval-Augmented Generation pipeline implemented in `frontend/src/lib/rag-service.ts` processes uploaded documents as follows:

```
[Uploaded Course PDF]
       │
       ▼
1. Document Parsing & Text Chunking (Sliding Window: 500 tokens, 50-token overlap)
       │
       ▼
2. Vector Embedding Generation (Google Text-Embedding-004 / 768 Dimensions)
       │
       ▼
3. Supabase pgvector Storage (Table: document_sections with subject_id, unit_id)
       │
       ▼
4. Contextual Query Retrieval (Cosine Similarity Match via match_documents function)
       │
       ▼
5. Contextual Prompt Assembly (Injected into Gemini / GPT-4o / Claude / Ollama)
```

The cosine similarity query executed in PostgreSQL via `pgvector` follows the standard metric:
$$\text{similarity}(A, B) = \frac{A \cdot B}{\|A\| \|B\|} = \frac{\sum_{i=1}^n A_i B_i}{\sqrt{\sum_{i=1}^n A_i^2} \sqrt{\sum_{i=1}^n B_i^2}}$$

In `rag-service.ts`, queries are scoped by applying SQL filters matching the active Scope level:
* **Scope 1 (Single Unit):** `WHERE subject_id = X AND unit_id = Y`
* **Scope 2 (Multi-Unit Merge):** `WHERE subject_id = X AND unit_id IN (Y1, Y2)`
* **Scope 3 (Subject Level):** `WHERE subject_id = X`
* **Scope 4 (Global Level):** Unrestricted across all student embeddings.

---

#### 4.5 Scientific Spaced Repetition (SuperMemo-2 Algorithm)
Flashcard scheduling in Exam-Buddy utilizes the SuperMemo-2 (SM-2) algorithm implemented in `frontend/src/lib/sm2-algorithm.ts`. When a student reviews a card and selects a response rating ($q \in \{1, 2, 4, 5\}$ corresponding to *Again, Hard, Good, Easy*), the engine computes the updated Easiness Factor ($EF$), Repetition Count ($n$), and Interval ($I$):

$$EF' = \max\left(1.3,\; EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))\right)$$

The review interval $I(n)$ in days is assigned according to:
$$I(n) = \begin{cases} 
1 & \text{for } n = 1 \\ 
6 & \text{for } n = 2 \\ 
I(n-1) \times EF' & \text{for } n > 2 
\end{cases}$$

If the student rates a card as *Again* ($q < 3$), the repetition count resets to $n = 0$ and the interval resets to $I = 1$ day, ensuring difficult concepts reappear promptly until mastered.

---

#### 4.6 Multi-Model AI Routing & Fallback Architecture
The multi-model routing service (`frontend/src/lib/ai-service.ts`) enables dynamic model selection based on task requirements and API key availability:

```
                      [Incoming AI Request]
                                │
                                ▼
                   Is Custom API Key Provided?
                     ├── YES ──► Use Selected Model (OpenAI / Claude / Gemini)
                     └── NO  ──► Check Local Ollama Gateway (http://localhost:11434)
                                   ├── AVAILABLE ──► Route to DeepSeek / Llama 3
                                   └── UNAVAILABLE ─► Route to Free Gemini Tier
```

This multi-model architecture prevents single-provider vendor lock-in and ensures platform usability even in zero-cost or offline environments.

---

#### 4.7 PYQ Frequency Analyzer & University Answer Structurer
The modules implemented in `frontend/src/lib/pyq-analyzer.ts` and `frontend/src/lib/exam-structurer.ts` automate exam-focused preparation:
* **PYQ Analyzer:** Parses past 3–5 year question papers, extracts repeated keywords, and tags topics with recurrence badges (*High Frequency [70%+], Medium Frequency [40-70%], Low Frequency [<40%]*).
* **Answer Structurer:** Re-formats raw AI outputs into standardized university exam answers:
  1. **Core Definition:** Concise 2-line definition suitable for top marks.
  2. **Architectural Diagram / Flowchart:** Textual block formatted for visual reproduction in answer booklets.
  3. **Key Bulleted Points:** Technical characteristics, pseudocode, or derivations.
  4. **Summary & Applications:** Concluding summary line.

---

#### 4.8 Key User Workflow

```
[1. Registration / Onboarding]
   └── Student sets handle (@durgesh_cs), selects B.Tech CS, Semester 5.

[2. Syllabus & File Upload]
   └── Student uploads "Operating_Systems_Unit3.pdf". Document is chunked and vectorized.

[3. Targeted RAG Learning]
   └── Student opens Scope 1 Chat: "Explain Page Replacement Algorithms with diagram."
   └── AI retrieves relevant PDF chunks and outputs structured markdown answer.

[4. Revision & Active Recall]
   └── Student clicks "Generate Flashcards". System creates deck of 10 cards.
   └── Student reviews cards using SM-2 buttons (Again, Hard, Good, Easy).

[5. Exam Testing]
   └── Student launches 15-minute timed OS Quiz.
   └── System scores results, calculates speed, and saves wrong answers to Mistake Notebook.
```

---

#### 4.9 Implementation Challenges & Solutions

1. **PDF Formula & Table OCR Quality:** Standard PDF text extractors failed on complex mathematical equations and multi-column table layouts.  
   *Solution:* Integrated a multimodal fallback pipeline in `ingest-pdf` using Gemini Vision parsing to transcribe complex structural sections into standardized Markdown.
2. **Context Window Limitations in RAG:** Ingesting entire textbooks overwhelmed model context windows and increased token latency.  
   *Solution:* Implemented sliding-window text chunking (500 tokens with 50-token overlap) combined with top-$K$ cosine similarity filtering ($K=4$), keeping context prompt sizes optimal.
3. **Graceful Fallback for Offline/Zero-Key Users:** System crash risk when backend database credentials or external API keys were omitted.  
   *Solution:* Developed `storage-service.ts` and `mock-data.ts`, enabling full local storage UI operation with simulated data when cloud services are unreachable.

---

#### 4.10 Verification & Testing Conducted
* **Functional Component Testing:** Verified component rendering, navigation, and modal behavior across Next.js App Router endpoints (`/chat`, `/subjects`, `/flashcards`, `/upload`, `/planner`, `/ai-manager`).
* **API Route Verification:** Validated payload handling, JSON response formatting, and error status codes for `/api/ai-stream`, `/api/generate-quiz`, and `/api/ingest-pdf`.
* **SM-2 Algorithm Validation:** Tested state updates for interval, repetition count, and easiness factor calculations against known test vectors over simulated multi-day review sequences.
* **UI Responsiveness & Theme Verification:** Tested responsive layout scaling across mobile (375px), tablet (768px), and desktop (1440px) viewports across dark-glassmorphism theme options.

---

**Guide Signature:** __________________  
**Coordinator Signature:** __________________

---

## WEEK 5 LOG ENTRY

**SEMESTER PROJECT-III**  
**Academic Year:** 2026–27 SEM-I  
**Week/Date:** 24-10-2026  
**Activity:** Section 5 — Project Outcomes  

---

### 5. PROJECT OUTCOMES

#### 5.1 Summary of Developed System
The development of **Exam-Buddy** has yielded a fully functional, responsive web application tailored for college exam preparation and personalized learning. By uniting document-grounded vector search, multi-model AI routing, scientific spaced repetition, and university exam answer formatting, the platform successfully bridges the gap between passive reading and structured academic performance.

```
                    +------------------------------------------+
                    |           EXAM-BUDDY PLATFORM            |
                    +--------------------+---------------------+
                                         |
         +-------------------------------+-------------------------------+
         |                               |                               |
         v                               v                               v
[CORE RAG ENGINE]               [ACTIVE RECALL]                 [EXAM SIMULATOR]
- 4 Context Scopes              - SM-2 Spaced Flashcards        - Timed Quizzes
- PDF Vector Ingestion          - Auto Deck Generation          - Negative Marking
- Grounded Answers              - 1v1 Peer Battle Arena         - Error Log Notebook
```

---

#### 5.2 Implemented Feature Summary

1. **Student Onboarding & Security:** Personalized student handles, academic profiles (Degree, Branch, Semester), dynamic dark-glassmorphic background themes, and student authentication.
2. **Hierarchical Syllabus & Course Navigator:** Unit-wise subject tree with progress tracking rings, YouTube lecture video player integration, and one-click formula sheet extraction.
3. **4-Scope RAG AI Engine:** Contextually bounded chat system supporting Single Unit (Scope 1), Multi-Unit (Scope 2), Subject Final (Scope 3), and Global Strategy (Scope 4) with 3-level explanation depth toggles.
4. **Multi-Model BYOK Router:** Client-side AES-256 key management supporting OpenAI (GPT-4o), Anthropic (Claude 3.5), Google Gemini, and Local Ollama with automatic fallback logic.
5. **SM-2 Spaced Repetition Flashcards:** Automated document-to-card deck generation, 3D flip interaction, and mathematical review scheduling based on user recall ratings (*Again, Hard, Good, Easy*).
6. **PYQ Frequency Analyzer & Answer Structurer:** Past-year question frequency indicator (High/Medium/Low badges) and automated answer formatting into standard university layouts.
7. **Exam Simulator & Mistake Notebook:** Custom quiz generator with time tracking, speed metrics, negative marking calculations, and automatic collection of incorrect answers into a dedicated error log notebook.
8. **Campus Cohort Infrastructure:** Shared batch timetables, exam countdown timers, and focus streak leaderboards.

---

#### 5.3 Benefits to Students
* **Reduced Search Time:** Centralizes course PDFs, notes, and PYQs into a single queryable environment.
* **Eliminated AI Hallucinations:** Document-grounded RAG ensures answers are derived directly from verified course syllabus documents.
* **Higher Memory Retention:** SM-2 active recall scheduling replaces passive cramming with scientific long-term memorization.
* **Targeted Revision:** PYQ frequency tagging helps students prioritize high-probability topics during limited exam preparation windows.
* **Exam-Aligned Formatting:** Structured 5/10-mark templates teach students how to organize written answers to satisfy university evaluation criteria.

---

#### 5.4 Learning Outcomes for Developers
Developing Exam-Buddy provided key practical insights in software engineering:
* **Modern Web Frameworks:** Gained proficiency with Next.js 16 App Router, Server/Client component separation, and React 19 state management.
* **Vector Databases & RAG Pipelines:** Understood document chunking strategies, embedding generation, and cosine similarity queries using Supabase `pgvector`.
* **Algorithmic Implementation:** Implemented cognitive scheduling algorithms (SuperMemo-2) and mathematically verified interval progression logic.
* **AI API Integration & Security:** Built multi-provider API proxy handlers, streaming client responses, and client-side AES-256 API key encryption.
* **UI/UX Engineering:** Mastered Tailwind CSS v4 design systems, glassmorphism visual styling, responsive design patterns, and micro-animations.

---

#### 5.5 Current System Limitations
1. **Client-Side Peer Battle Simulation:** The 1v1 Peer Battle mode currently uses client-side code matching rather than a full WebSocket back-end server connection.
2. **Local Storage Fallback Scope:** While LocalStorage fallback allows offline demoing, cloud vector search requires an active internet connection and Supabase endpoint.
3. **OCR Processing Speed for Large PDFs:** Ingesting scanned PDFs over 50 pages requires batch processing, which can take several seconds depending on internet bandwidth.

---

#### 5.6 Planned Future Enhancements

```
+-------------------------------------------------------------------------------+
|                           FUTURE ENHANCEMENTS ROADMAP                         |
+-------------------------------------------------------------------------------+
|  1. Full WebSocket Backend     --> Real-time 1v1 multiplayer peer quiz battles |
|  2. Native Mobile Applications --> Cross-platform iOS/Android apps (React Native) |
|  3. Predictive Grade Analytics --> ML model forecasting exam scores from trends|
|  4. Automated Audio Summaries  --> AI podcast-style audio summaries of notes   |
+-------------------------------------------------------------------------------+
```

---

**Guide Signature:** __________________  
**Coordinator Signature:** __________________

---

## WEEK 6 LOG ENTRY

**SEMESTER PROJECT-III**  
**Academic Year:** 2026–27 SEM-I  
**Week/Date:** 31-10-2026  
**Activity:** Section 6 — Conclusions & References  

---

### 6. CONCLUSIONS AND REFERENCES

#### 6.1 Conclusion
The **Exam-Buddy** project successfully demonstrates the design and execution of an AI-powered adaptive exam preparation and personalized learning platform for undergraduate engineering students. By identifying the limitations of static learning management systems and unrestricted generative AI chatbots, the project engineered a targeted academic operating system that combines syllabus-grounded Retrieval-Augmented Generation (RAG) with scientific active recall strategies.

Through its 4-Scope RAG engine, Exam-Buddy provides students with variable context scoping—allowing precise single-unit queries for daily lectures as well as broad subject synthesis for final examinations. The integration of the SuperMemo-2 (SM-2) algorithm automates spaced repetition flashcard scheduling, transforming passive reading habits into active memorization routines. Furthermore, features such as the PYQ Frequency Analyzer, 5/10-Mark Answer Structurer, and multi-model BYOK router provide practical tools designed directly around the realities of university examination systems.

Built using Next.js 16, TypeScript, Tailwind CSS v4, and Supabase `pgvector`, the platform delivers high performance, secure data isolation via PostgreSQL RLS, and an aesthetic dark-glassmorphic user interface. Overall, Exam-Buddy achieves its core objective: providing students with a structured, reliable, and intelligent environment to optimize study efficiency and improve academic outcomes.

---

#### 6.2 References & Bibliography

1. **Next.js Documentation:** Vercel Inc., "Next.js 16 App Router Documentation," 2026. [Online]. Available: `https://nextjs.org/docs`
2. **React Documentation:** Meta Open Source, "React 19 Developer Guide," 2026. [Online]. Available: `https://react.dev`
3. **Supabase & pgvector Documentation:** Supabase Inc., "Vector Search and Embeddings with pgvector," 2026. [Online]. Available: `https://supabase.com/docs/guides/database/extensions/pgvector`
4. **SuperMemo Algorithm Specification:** W. Woźniak, "SuperMemo 2 (SM-2) Algorithm Specification," SuperMemo World, 1990. [Online]. Available: `https://www.supermemo.com/en/archives1990-2015/english/ol/sm2`
5. **Google Gemini API Reference:** Google AI for Developers, "Gemini API Overview & Text Embeddings Guide," 2026. [Online]. Available: `https://ai.google.dev/docs`
6. **Retrieval-Augmented Generation (RAG) Foundations:** P. Lewis et al., "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks," in *Advances in Neural Information Processing Systems (NeurIPS)*, vol. 33, pp. 9459–9474, 2020.
7. **Tailwind CSS Specification:** Tailwind Labs Inc., "Tailwind CSS v4 Engine Documentation," 2026. [Online]. Available: `https://tailwindcss.com/docs`
8. **TypeScript Handbook:** Microsoft Corp., "TypeScript 5.x Language Reference," 2026. [Online]. Available: `https://www.typescriptlang.org/docs/`

---

**Guide Signature:** __________________  
**Coordinator Signature:** __________________
