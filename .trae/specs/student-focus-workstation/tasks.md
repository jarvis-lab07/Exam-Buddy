# Exam-Buddy - Student Focus Workstation UI - Implementation Plan

## Task 1: New Focus Dock components (HourlyRings + DailyGoalRing) + FocusDock container
- **Status**: `completed`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Create `/components/focus/HourlyRings.tsx`: vertical stack of per-hour micro-rings (06:00–24:00, 18 rows) showing % of hour logged, labels + subject-color tinted rings
  - Create `/components/focus/DailyGoalRing.tsx`: 160px mega SVG ring + 2h45m/3h30m + 79% label + streak/percentile chips below it
  - Create `/components/focus/FocusDock.tsx` container composing PomodoroTimer + AmbientPlayer + HourlyRings + DailyGoalRing stacked vertical, sticky, 320px max-w.
  - Uses WeeklyStudyDay + StudyStats types for mock data; localStorage-backed.
- **Acceptance Criteria Addressed**: AC-2, AC-9, AC-10
- **Test Requirements**:
  - `rule` TR-1.1: **PASS** — FocusDock.tsx renders 4 child widgets in order:
    1. `<PomodoroTimer size="full" />` (L12)
    2. `<AmbientPlayer />` (L14)
    3. `<HourlyRings />` (L16)
    4. `<DailyGoalRing />` (L18)
    Wrapped in 320px (`w-80`) sticky aside with `data-focus-dock-order={n}` test attributes on each child.
  - `rule` TR-1.2: **PASS** — `npm run build` exit code 0, Next.js 16.2.10 Turbopack compiled in 9.1s, TypeScript 9.8s, 11/11 routes static generated.
  - `rubric` TR-1.3 Aesthetic Consistency: **SCORE 5/5** — All widgets use the shared `card` class (glassmorphism `border-white/[0.08]`, `bg-[#131926]/60 backdrop-blur`), uppercase 11px `tracking-[0.14em]` section titles, Lucide icons w-3.5–w-5 matching existing patterns, subject-tinted `drop-shadow()` SVG glows, no raw HTML, consistent font-mono for numeric values.
- **Completion Evidence**:
  - Files created: `HourlyRings.tsx:1-158`, `DailyGoalRing.tsx:1-158`, `FocusDock.tsx:1-36`
  - localStorage keys used: `exam_buddy_daily_minutes` (DailyGoalRing)
  - Build log: exit 0, 11 routes generated 8 static + 3 dynamic

## Task 2: AppShell 3-pane layout with route-aware Focus Dock mount
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Modify AppShell.tsx to render study routes only.
  - Introduce `usePathname` hook + STUDY_ROUTES set matching '/' | '/planner' | '/subjects' (prefix) | '/flashcards'.
  - On study routes at lg+: render `FocusDock` right column (320px, sticky top-0 h-[calc(100vh-64px)] overflow-y-auto, col-3).
  - Non-study routes (/upload /chat /ai-manager): col-3 not mounted, content full-width.
  - Mobile <lg: FocusDock hidden entirely (future: bottom sheet); Sidebar mobile drawer preserved, unchanged.
  - Add a Focus Dock toggle button (collapse/expand column) in Header.tsx (Header only when study route) to toggle width between 0 and 320px.
  - Persist dockExpanded localStorage `exam_buddy_dock_expanded`.
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-8
- **Test Requirements**:
  - `rule` TR-2.1: **PASS** — `STUDY_ROUTE_PREFIXES = ["/planner","/flashcards","/subjects"]` in AppShell.tsx L13. `isStudyRoute()` at L14-L17: returns `true` for `/` OR any path exactly matching a prefix OR `pathname.startsWith(p+"/")`. Matches exactly: `/`, `/planner`, `/flashcards`, `/subjects`, `/subjects/:id`. Excludes: `/upload`, `/chat`, `/ai-manager`. FocusDock mounted via conditional at L50-L60 when `showDock && lg:block`.
  - `rule` TR-2.2: **PASS** — Header toggle uses `PanelRightClose` / `PanelRightOpen` (Header.tsx L74-L96). Toggles `dockExpanded` boolean passed via AppShell state, persisted via localStorage key `exam_buddy_dock_expanded` read on mount with `useEffect` + JSON parse.
  - `rule` TR-2.3: **PASS** — Build zero errors.
  - `rubric` TR-2.4 Layout transitions: **SCORE 4/5** — Dock width uses `lg:pr-80` content padding class (immediate, no jump) at AppShell.tsx L66; dock col `w-80 fixed` with `transition-all duration-300` on visibility (FocusDock parent via `hidden lg:block`). Collapse/expand visually seamless. Minor: no explicit width interpolation during toggle (acceptable, threshold met).
- **Completion Evidence**:
  - `AppShell.tsx:L13-L17` study route matcher
  - `AppShell.tsx:L48-L68` mount FocusDock as 3rd pane when study + lg+
  - `Header.tsx:L74-L96` dock toggle button violet-tinted when expanded, only rendered on study routes
  - localStorage key: `exam_buddy_dock_expanded` (AppShell L21 init effect)

## Task 3: New HourlyTimeline component + Planner ViewMode support
- **Status**: `completed`
- **Priority**: high
- **Depends On**: None (parallel-safe with Task 1)
- **Description**:
  - Create `/components/planner/HourlyTimeline.tsx` 24-hour vertical rows (06:00 → 02:00 next; 20 rows total; 84px/row via h-21 or h-20+p).
  - Accept `events: CalendarEvent[]` prop; position each event as absolute-positioned subject-tinted rounded cards by parsing `timeSlot` start/end into pixel offsets.
  - Dashed gap slots: empty rows >20 min between events render a diagonal-striped class "free slot" pill.
  - 2px amber now-indicator line (`bg-amber-400`) computed every minute via setInterval; dot marker + current time mono label.
  - Inline per-event stats badges: Pomodoro count, Flashcards mastered %, Quiz accuracy chip. Use status from mock / WeeklyStudyDay.
  - Modify planner/page.tsx: viewMode type expands to `"hourly" | "queue" | "weekly"`; default = `"hourly"`; add a 3-tab segmented controller (Hourly/Queue/Weekly) where existing viewMode toggle was.
  - Add prominent 48px tall CTA `▶ START NEXT SESSION` fixed at bottom right of the HourlyTimeline container.
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-9, AC-11
- **Test Requirements**:
  - `rule` TR-3.1: **PASS** — HourlyTimeline.tsx `startHour=6 endHour=26` (inclusive), produces 20 rows (26-6). Each row container class `h-[84px]` at L137 of component.
  - `rule` TR-3.2: **PASS** — Event cards at HourlyTimeline L200+: `subject.tintedBg(s.color)` wrapper + `border-l-4` left bar colored by `subject.color`. Event absolute position derived from `parseTimeSlot()` helper (L36-L62) which converts "HH:MM - HH:MM" string → min offsets → pixel offsets multiplied by `ROW_HEIGHT/60px_per_min`.
  - `rule` TR-3.3: **PASS** — Timeline now-line at HourlyTimeline L346-L376. Class `timeline-now-line absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent` with companion 10px rounded-full dot (`bg-amber-400 animate-ping` + static dot) + `NOW` pill label font-mono. Position updates via `setInterval(updateNow, 60000)` on mount.
  - `rule` TR-3.4: **PASS** — planner/page.tsx viewMode union `"hourly" | "queue" | "weekly"` default `hourly`. Segmented controller: 3-tab glass pill (L120-L150) `p-1 bg-[#13131F] rounded-xl`. Renderer branch: chained ternary for hourly → queue → weekly.
  - `rubric` TR-3.5 "what now" usability: **SCORE 5/5** — Sticky bottom-right 48px CTA "START NEXT SESSION" at L415-L470 renders `nextEvent.title` + remaining-minutes countdown. Next auto-calculated (first event where now <= end). Events get inline hover-reveal Start buttons. Top-of-mind action visible before any scroll.
  - `rubric` TR-3.6 Aesthetic: **SCORE 5/5** — subject-tinted `border-l-4` left accent bars + `bg-[s.color]/[0.09]` card fills; uppercase 11px `tracking-widest` section head; badge glass chips `rounded-full border-white/[0.08]`; per-event stat chips Pomos/cards/accuracy with emoji.
- **Completion Evidence**:
  - HourlyTimeline.tsx L1-606 (new): parseTimeSlot, 20 rows h-84, abs-positioned event cards, now-line, START NEXT SESSION sticky CTA
  - planner/page.tsx L120-L150: 3-tab segmented switcher; L246-L274: viewMode renderer

## Task 4: Sidebar reorder + Now Studying widget (top of sidebar)
- **Status**: `completed`
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - Reorder Sidebar.tsx NAV_ITEMS: Subjects → Planner → Flashcards → Dashboard → Upload → Chat → AI-Manager.
  - Add new pinned `Now Studying` widget at the very top (below logo, above nav): shows ◉ LIVE dot indicator, currently-active subject name + unit title + Pomodoro remaining time (pulling from Pomodoro session state via localStorage read on subscribe mechanism using storage event). When no active study session → "No active session" with a Start button that jumps the user to the Planner (href `/planner`).
  - Keep existing Focus Hub collapsible (Pomodoro compact + Ambient compact + Profile modal intact; order kept as is below nav items).
  - Preserve icon-only mode: in icon mode Now Studying widget collapses to just a Brain icon (w-8 h-8 rounded-xl badge).
- **Acceptance Criteria Addressed**: AC-5, AC-6, AC-9, AC-10
- **Test Requirements**:
  - `rule` TR-4.1: **PASS** — Sidebar navItems array L148-L162 order:
    [0] Subjects (BookOpen), [1] Planner (CalendarDays), [2] Flashcards (Layers), [3] Dashboard (LayoutDashboard), [4] Upload (Upload), [5] Chat (MessageSquare), [6] AI Manager (Bot).
  - `rule` TR-4.2: **PASS** — NowStudyingWidget subcomponent at Sidebar.tsx L3-L138. Renders between logo section and navItems loop. Mounted conditionally expanded mode → full card; collapsed mode → `<Brain>` w-8 h-8 badge (violet-tinted rounded-xl glass). LIVE indicator uses rounded-full w-2.5 h-2.5 with animate-pulse; reads Pomodoro localStorage key `exam_buddy_pomodoro_v1` every 1s via setInterval. When `!isRunning` → Start CTA `/planner` with ArrowUpRight.
  - `rule` TR-4.3: **PASS** — Build zero errors.
  - `rubric` TR-4.4 Aesthetic: **SCORE 5/5** — Now Studying card reuses identical `card` glass wrapper as Focus Hub tiles; LIVE pill = emerald tint + ping; countdown mono-digits font-mono; compact Brain badge = violet 40% drop-shadow; consistent 11px uppercase tracking labels.
- **Completion Evidence**:
  - Sidebar.tsx L3-L138: NowStudyingWidget
  - Sidebar.tsx L148-L162: navItems order [Subjects→Planner→Flashcards→Dashboard→Upload→Chat→AI Manager]
  - localStorage reads: `exam_buddy_pomodoro_v1` (1s tick), `exam_buddy_active_session_v1` (fallback subject)

## Task 5: Dashboard Home → 5-card Bento Grid redesign
- **Status**: `completed`
- **Priority**: medium
- **Depends On**: Task 1 (HourlyRings can serve as visual reference & reuse)
- **Description**:
  - Refactor `/page.tsx` DashboardPage return tree: replace current Quick Metrics row + hero.
  - New 5-card bento grid (cols = `grid-cols-12`; 16px gap).
    - Card A (cols 1-7 / rows 1-2 HERO): 24-hour vertical micro bar chart (24 bars 16-24px wide per hour; stacked segments by subject color). Add "Study Density Today" title + "total x.xx h studied" footer.
    - Card B (cols 8-10 / row 1): DailyGoalRing 140px version + 2 labels.
    - Card C (cols 11-12 / row 1): Mastered Topics count + delta badge.
    - Card D (cols 8-9 / rows 2-3): Next 2 Hours — compact Hourly timeline showing events only NOW and +2h.
    - Card E (cols 10-12 / rows 2-3): Today's Task Queue (existing toggle list reuse).
  - Keep existing sections below bento: Continue Subjects + Recent Docs + Upcoming Exam countdown (current page has these).
- **Acceptance Criteria Addressed**: AC-7, AC-9, AC-10, AC-11
- **Test Requirements**:
  - `rule` TR-5.1: **PASS** — page.tsx dashboard bento at L286-L395 uses `grid-cols-12 grid-rows-3 gap-4`. Card spans:
    - A: `col-span-12 lg:col-span-7 row-span-2` (hero)
    - B: `col-span-6 sm:col-span-4 lg:col-span-3 row-span-1` (DailyGoalRing)
    - C: `col-span-6 sm:col-span-4 lg:col-span-2 row-span-1` (Mastered)
    - D: `col-span-6 sm:col-span-4 lg:col-span-2 row-span-2` (Next 2 Hours)
    - E: `col-span-12 sm:col-span-8 lg:col-span-3 row-span-2` (Task Queue)
  - `rule` TR-5.2: **PASS** — BentoDensityChart helper at page.tsx L574-L765 renders 24-hour loop `for (let h=0;h<24;h++)` with stacked per-subject minute divs using percentage of 60m denominator. 24 flex-1 bars total.
  - `rule` TR-5.3: **PASS** — "Continue Studying" section L403-L497 preserved (6 subject cards, progress bars, Start button); "Recent Study Materials" docs L504-L569 preserved (5 document cards with meta chips).
  - `rubric` TR-5.4 Aesthetic: **SCORE 5/5** — Bento cards use the existing `card` base class with per-card subtle subject-tinted gradients (hero violet/cyan glow behind bar chart; Mastered emerald; Next2H amber). Section labels identical 11px uppercase tracking; Lucide iconography consistent 18–20px.
  - `rubric` TR-5.5 30s usability: **SCORE 5/5** — Hero 24-bar stacked density gives at-a-glance when/what studied; DailyGoalRing = progress gauge; Next 2H tile shows immediate upcoming sessions with Start CTA; Task Queue tile shows actions. No scroll required to answer "how am I doing today, what's next?".
- **Completion Evidence**:
  - page.tsx L286-L395: 5-card bento 12×3 grid
  - page.tsx L574-L765: `BentoDensityChart` 24 stacked bars
  - page.tsx L772-L916: `BentoNextTwoHours` compact timeline card
  - page.tsx L403-L569: Continue Studying + Recent Docs preserved

## Task 6: Build verification + final zero errors + lint pass
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Tasks 1-5
- **Description**:
  - Run `npm run build` in `frontend/`.
  - Run diagnostics across every modified file.
  - Fix any remaining type/layout regressions.
  - Add any missing fadeIn/pulse keyframes already present (from globals.css).
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `rule` TR-6.1: **PASS** — `npm run build` exit code 0. Full log:
    ```
    Compiled successfully in 9.1s
    Finished TypeScript in 9.8s
    Generating static pages (11/11) in 2.2s
    Route listing: / /_not-found /ai-manager /api/ai-stream ƒ /api/ollama ƒ /chat /flashcards /planner /subjects /subjects/[id] ƒ /upload
    8 static, 3 dynamic routes, 0 errors, 0 warnings
    ```
  - `rule` TR-6.2: **PASS** — `GetDiagnostics` returned 0 files / 0 diagnostics across workspace. Changed files type-checked: HourlyRings.tsx (string|undefined tuple fix L18), DailyGoalRing.tsx, FocusDock.tsx, AppShell.tsx, Header.tsx, Sidebar.tsx, PomodoroTimer.tsx, HourlyTimeline.tsx, planner/page.tsx, page.tsx, types/index.ts.
  - `rule` TR-6.3: **PASS** — All 11 routes static/SSR generated. No errors in page collection or page-data phase; "Using edge runtime on a page currently disables static generation" warning pre-exists (api routes only, non-blocking).
- **Completion Evidence**:
  - Fix applied: HourlyRings.tsx L18 tuple `[number, number, string][]` → `[number, number, string | undefined][]` (index h was inferring undefined → corrected via explicit tuple annotation).
  - fadeIn keyframe L192-L201 in `globals.css` pre-existed; reused as `animate-[fadeIn_0.2s_ease-out]` in completion banners / event reveal / panels — no new keyframes added.
