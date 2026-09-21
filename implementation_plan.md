# Task 2 – Universal Subjects & Units Explorer

## Goal
Implement the `/subjects` page where students can select **any degree, any semester/year**, create custom subjects, view a hierarchical unit tree, and launch context‑aware AI chats, flashcards, and note uploads.

## User Review Required
> [!IMPORTANT]
> This change adds new TypeScript interfaces, mock data, UI components, and a new page route. It will modify several directories (`src/types`, `src/lib`, `src/components/subjects`, `src/app/subjects`). Review the component hierarchy and naming conventions before we commit.

## Open Questions
- Should we persist newly created subjects to a backend (Supabase) now, or keep them in local state for the MVP?
- Preferred color‑picker UI library (e.g., `react-colorful` vs custom Tailwind picker)?

## Proposed Changes
---
### Types & Mock Data
#### [MODIFY] [src/types/index.ts](file:///J:/Vibe-Projects/Exam-Buddy/frontend/src/types/index.ts)
- Add `Degree` union type and expanded `Subject`/`Unit` interfaces.
#### [NEW] [src/lib/mock-data.ts](file:///J:/Vibe-Projects/Exam-Buddy/frontend/src/lib/mock-data.ts)
- Provide multi‑degree sample data (Engineering, Medicine, Law, Commerce).
---
### UI Components (subjects folder)
#### [NEW] [src/components/subjects/DegreeFilter.tsx](file:///J:/Vibe-Projects/Exam-Buddy/frontend/src/components/subjects/DegreeFilter.tsx)
- Horizontal pill selector for degrees and semester/year dropdown.
#### [NEW] [src/components/subjects/SubjectCard.tsx](file:///J:/Vibe-Projects/Exam-Buddy/frontend/src/components/subjects/SubjectCard.tsx)
- Glassmorphic card with progress ring, resource counters, expandable unit list.
#### [NEW] [src/components/subjects/UnitListItem.tsx](file:///J:/Vibe-Projects/Exam-Buddy/frontend/src/components/subjects/UnitListItem.tsx)
- Unit row with status badge, topic tags, and action buttons (AI Tutor, Flashcards, Upload).
#### [NEW] [src/components/subjects/AddSubjectModal.tsx](file:///J:/Vibe-Projects/Exam-Buddy/frontend/src/components/subjects/AddSubjectModal.tsx)
- Modal form for creating a new subject (title, code, degree, term, exam date, color).
---
### Page Route
#### [NEW] [src/app/subjects/page.tsx](file:///J:/Vibe-Projects/Exam-Buddy/frontend/src/app/subjects/page.tsx)
- Header, search bar, `DegreeFilter`, subject‑grid, empty‑state illustration.
---
### Build & Commit
- Run `npm run build` to ensure zero compile errors.
- Commit with conventional message:
  `feat: implement universal subjects & units explorer with degree switcher`.

## Verification Plan
### Automated Tests
- No new test files this sprint; rely on `npm run build` for type safety.
### Manual Verification
- Open http://localhost:3000/subjects.
- Verify degree filter works, subjects display correctly, unit accordion expands.
- Click each action button to ensure routing to `/chat`, `/flashcards`, `/upload` with query params.
- Add a new subject via the modal and confirm it appears instantly.

---
*Once you approve this plan, I will execute the changes and push a clean commit on `feature/durgesh-subjects-explorer`.*
