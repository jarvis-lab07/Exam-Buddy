# Exam-Buddy - Student Focus Workstation UI - Product Requirements Document

## Overview
- **Summary**: Implement a 3-pane "Focus Workstation" layout, Hourly Timeline, sidebar re-ordering, Dashboard Bento Grid, and sticky Focus Dock. Optimizes the app for *hour-by-hour* exam study sessions so a student can answer "what now?", "what next?", and "am I on track?" without navigating away.
- **Purpose**: The current UI pages are great for planning, but students studying 3+ hours in a row need a time-axis view plus persistent focus tools. The current layout forces tab/nav switching between planner/timer/flashcards which breaks study flow and reduces session quality.
- **Target Users**: University students preparing for midterm exams (Engineering/Medicine/Law/etc.) who study in 1-4 hour blocks.

## Goals
- **G-1**: A student can open the app and know exactly what to study in the *current hour* within 3 seconds.
- **G-2**: PomodoroTimer, AmbientPlayer, hour-by-hour progress, daily goal, and queue view are all simultaneously visible in the same layout without scrolling during a study block.
- **G-3**: Every study session can be conducted without ever navigating away from the workspace — subjects/units/flashcards load inline in a "Deep Work Canvas".
- **G-4**: At a glance (30-second dashboard check-in) shows hour-by-hour study density for the day.

## Non-Goals
- **NG-1**: No backend / Supabase integration work in this spec. All state via localStorage + existing MOCK_ data.
- **NG-2**: No calendar month view, no drag-and-drop scheduling.
- **NG-3**: No auth / user accounts.
- **NG-4**: No flashcard engine changes (spaced repetition algorithm unchanged).

## Background & Context
- Current implementation state (Sep 26 2026): 7 pages all render and `npm run build` passes 0 errors.
- PomodoroTimer 2.0 (persistent + full/compact) just shipped in session 20260926.
- AmbientPlayer exists standalone.
- WeeklyCalendarView exists but only shows per-day event lists, not hourly time-axis.
- AppShell is 2-pane: Sidebar + Header + main content. No sticky dock on the right.
- Sidebar nav order (Dashboard→Subjects→Upload→Chat→Planner→Flashcards→AI-Manager) is wrong for actual study flows.

## Functional Requirements
- **FR-1 — 3-Pane Workstation Layout**: Routes matching AppShell on study routes renders: `/`, `/planner`, `/subjects/*`, `/flashcards`. Third column (Focus Dock") 320px wide, sticky, never scrolls.
- **FR-2 — Focus Dock Composition: Contains (in order): PomodoroTimer full-size, AmbientPlayer, HourlyRings widget (hour-by-hour % completion), Daily Goal mega-ring, streak + percentile chip.
- **FR-3 — Hourly Timeline (Time-Axis) Component: 24h vertical rows (06:00 to 02:00 next day). Colored subject-tinted event cards per existing CalendarEvent type. Dashed free-slot gaps. Live amber "now" indicator line. Inline Pomodoro/flashcard/accuracy stats per completed block.
- **FR-4 — Planner Hourly ViewMode**: Planner page `/planner` supports `viewMode: "hourly" | "queue" | "weekly"`. Default = hourly.
- **FR-5 — Sidebar Reorder + Now Studying Widget: Nav order: Subjects → Planner → Flashcards → Dashboard → Upload → Chat → AI-Manager. Now Studying live widget above nav.
- **FR-6 — Dashboard Bento: Home page `/` reworked into 5-card bento grid: Hero = 24h Hour-by-Hour micro bar chart, Daily Goal ring, Mastered topics card, Next-2-Hours timeline block, Today Task Queue.
- **FR-7 — Collapsible Focus Dock: Focus dock close button → reduces column to 0 width with toggle in Header.
- **FR-8 — Study Route Detection: Full-width routes `/upload`, `/chat`, `/ai-manager` keep current layout (no Focus Dock).
- **FR-9 — All state persists: HourlyRings + Now Studying + Dock width + sidebar reorder + viewMode all persisted via localStorage.

## Non-Functional Requirements
- **NFR-1**: `npm run build` zero errors on completion.
- **NFR-2**: No raw HTML, consistent obsidian glassmorphism (card borders border-white/[0.08], bg #0B0F17, accent glows) matching existing palette.
- **NFR-3**: Mobile responsive (lg breakpoint; <lg collapses Focus Dock + sidebar into tabs/Hamburger).
- **NFR-4**: All existing MOCK data sources continue to work without modification.

## Constraints
- **Technical**: Next.js 16 App Router, TypeScript Strict, Tailwind v4, Lucide React only. localStorage for persistence, no Supabase yet. Reuse existing types StudyTask CalendarEvent WeeklyStudyDay PomodoroSession UserProfile.
- **Business**: Feature-branch git protocol + atomic commits (convential). No direct-to-main work.
- **Dependencies**: Existing components reuse: PomodoroTimer, AmbientPlayer, WeeklyCalendarView, AddTaskModal, Header, Sidebar.

## Assumptions
- Student studies at least 1h blocks between 08:00 and 23:00 local time.
- PomodoroTimer.start() will be extended with subjectId binding (optional) in the Future – for Now Studying widget (FR-5 displays fallback "No active session" when empty.
- HourlyRings derives from WeeklyStudyDay (mock) today row minutes / 60 target hour buckets.

## Acceptance Criteria

### AC-1: 3-Pane Workstation renders on study routes
- **Type**: `rule`
- **Given**: User navigates to `/`, `/planner`, `/subjects/any`, `/flashcards` with viewport width `lg+ (>=1024px)
- **When**: Page renders
- **Then**: A third sticky right column 320px wide renders (Focus Dock)
- **Pass Condition**: Right column DOM element with class `focus-dock` exists in AppShell children, width 288-368px; sidebar, non-zero visible
- **Evidence**: AppShell.tsx render with conditional render() output; screenshot/read of layout test.

### AC-2: Focus Dock contains required widgets
- **Type**: `rule`
- **Given**: Focus Dock is visible (>=1024px)
- **When**: User inspects focus-dock contents in DOM top-to-bottom
- **Then**: PomodoroTimer (full-size), AmbientPlayer, HourlyRings, Daily mega-ring, streak chip all present (in order)
- **Pass Condition**: DOM contains `data-testid (or class markers) for all 5 widgets; order=pomodoro, ambient, hourly-rings, daily-ring, streak-chip
- **Evidence**: Read of dock rendering output listing node children render in AppShell

### AC-3: Hourly Timeline renders vertical 24 time rows, 84px height, event bars
- **Type**: `rule`
- **Given**: viewMode=hourly on /planner
- **When**: Component mounts with MOCK_CALENDAR_EVENTS
- **Then**: 20 hourly row elements (06:00 through 02:00) render 84px tall each; at least one CalendarEvent appears as a colored subject-tinted bar
- **Pass Condition**: N >= 20 rows; all row heights 84px (approx via Tailwind h-20/h-21 i.e. 80-88px); >=1 event card rendered with subject color tinting based on MOCK data
- **Evidence**: Render of HourlyTimeline.tsx output; counts via Read of component

### AC-4: Hourly Timeline live "now" line
- **Type**: `rule`
- **Given**: HourlyTimeline mounted and current real time is between 06:00 - 02:00
- **When**: Between rows that include the current hour
- **Then**: A 2px amber line cuts horizontally the pane, with a dot indicator next to the current time
- **Pass Condition**: DOM node class=timeline-now 存在且style/ amber( bg-amber-400/500 colors
- **Evidence**: Component render snippet of line node

### AC-5: Sidebar nav order
- **Type**: `rule`
- **Given**: Sidebar in default expanded state
- **When**: Read nav elements top→bottom
- **Then**: Subjects, Planner, Flashcards, Dashboard, Upload, Chat (AI optional lower AI Manager
- **Pass Condition**: Order nav[0]=Subjects, [1]=Planner, [2]=Flashcards, [3]=Dashboard,...
- **Evidence**: Read of Sidebar.tsx rendered NAV_ITEMS ordering

### AC-6: Now Studying Widget sidebar top
- **Type**: `rule`
- **Given**: Sidebar expanded
- **When**: Widget renders
- **Then**: Widget above NAV renders pomodoro/subject link with ◉ live + subject name + unit + remaining time (or fallback "No active session")
- **Pass Condition**: DOM marker exists data-class "now-studying-widget" + content
- **Evidence**: Sidebar.tsx render snippet widget

### AC-7: Dashboard bento grid
- **Type**: `rule`
- **Given**: Navigate `/` on desktop
- **When**: Home renders
- **Then**: 5-card 16px gap bento grid loads; hero 24h hour micro bar chart 16×24 pixel bars, daily goal ring, mastered, next2h queue; Today queue all rendered;
- **Pass Condition**: Home page DOM layout visibly rearranged; replaced old metric row becomes the new bento layout;
- **Evidence**: Read of page.tsx (DashboardPage return tree

### AC-8: Full-width non-study routes
- **Type**: `rule`
- **Given**: lg viewport >=1024px; route /upload, /chat, /ai-manager
- **When**: Page renders
- **Then**: No Focus dock; right column=0; main takes up full available width (not dock width space; no empty); layout matches current full-width.
- **Pass Condition**: usePathname() returns one of those 3 routes; right-dock column unmounted
- **Evidence**: AppShell conditional logic snippet

### AC-9: Build zero errors
- **Type**: `rule`
- **Given**: Frontend package build run `frontend/ folder
- **When**: `npm run build`
- **Then**: exit code=0; 0 warnings TypeScript warnings; all routes 11 routes continue
- **Pass Condition**: npm run build exits 0 zero type errors
- **Evidence**: npm run build output log exit code

### AC-10: Glassmorphism aesthetic consistency
- **Type**: `rubric`
- **Dimension**: UI visual consistency with existing design language
- **Scale**: 1-5
- **Anchors**: 1 = jarring mismatches, raw html, wrong palette; 3 = passable but inconsistent shadows/borders/gradients; 5 = identical card borders border-white/[0.08] bg #0B0F17; exact consistent lucide icon sizes matching all existing card patterns matching typography font-mono, accent colors violet/emerald/cyan/amber
- **Pass Threshold**: >= 4
- **Evidence**: Visual/component-level compare code against globals.css tokens and existing components (Sidebar cards WeeklyCalendarView; card class .glass

### AC-11: Student usability 3-second "what now" scan
- **Type**: `rubric`
- **Dimension**: Speed of student decision-making
- **Scale**: 1-5
- **Anchors**: 1 = still confused what-to-do hunting; 3 = found task queue+ planner obvious after 20 seconds; 5 = Current hour next-action obvious in Hourly Timeline + "Start Next Session" big CTA visible without any scroll;
- **Pass Threshold**: >= 4
- **Evidence**: Render of layout CTA visual placement visual
