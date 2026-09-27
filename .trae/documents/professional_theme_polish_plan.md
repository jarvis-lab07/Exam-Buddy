# Professional Theme Polish — Implementation Plan

## Repository Research

### Current "AI-made" visual tells identified (Grep audit — 24 files / 88 matches of AI-typical flourishes)

1. **Over-abused gradient surfaces on every card** — `bg-gradient-to-br from-violet via-indigo to-transparent` + `blur-3xl` ambient glows appear on Dashboard hero, SubjectCard header, NowStudyingWidget, AddSubjectModal header, Pomodoro focus panel, FileDropzone active state, HourlyTimeline events, Planner banner, Chat header, Upload page header, Upload page hero, ProfileEditModal hero, AddTaskModal hero. In a professional app only the *primary* hero/brand surface gets a tint; everything else is flat/slightly-elevated neutral surfaces.
2. **Every `card-interactive`/`glass-card-interactive` lifts on hover with indigo ring + colored shadow** — `translateY(-2px) + shadow-xl shadow-indigo + 0 0 0 1px indigo ring`. Professional SaaS elevates ~1px max on hover and uses a *subtle border-color shift* (not colored drop shadows + 1px halos) for focus.
3. **`animate-ping` + `animate-pulse` stacked on the same status dots** — seen in Pomodoro live indicators, Sidebar NowStudyingWidget live dot, HourlyTimeline now-line ping, Planner queue urgent items. Ping is useful *once per page max* for "currently recording/live" — not on every status dot.
4. **Inconsistent rounded corners:** Cards use `rounded-3xl` mixed with `rounded-2xl` mixed with `rounded-xl` mixed with `rounded-2.5xl` (non-Tailwind literal). Pro UI standardizes to ONE large radius (cards = 2xl), medium (chips/inputs = xl), small (badges/dots = lg/9999px for pills).
5. **Colored `shadow-lg shadow-<color>/30` on every CTA/button** — e.g. `shadow-xl shadow-violet-600/30` on Pomodoro Start, Start Session CTA, Ask AI Tutor button, Upload CTA, etc. Only PRIMARY CTAs get a soft colored shadow; secondary actions use `shadow-sm` / none.
6. **`hover:scale-[1.02-1.005]` on 11+ buttons and cards.** Scale-on-hover is an AI-typical flourish; professional productivity UI *never* scales interactive elements (causes pixel misalignment). Prefer border/background/opacity transitions only.
7. **Radial ambient glow background has THREE colors at once** (violet at top-left, indigo at top-right, cyan at bottom-right) all at ~0.14-0.18 alpha. Professional apps use a *single* ~4% tinted ambient wash — NOT three competing neon-corners that look like a login page mockup.
8. **Status badges all have heavy tinted backgrounds:** `bg-emerald-500/14 border-emerald-500/35 text-emerald-300`, same for amber/rose/violet/indigo/... This creates a "rainbow palette" effect. Pro SaaS uses `bg-white/[0.03]` base with a *small colored left-border/dot only* for status; tints are reserved for high-severity/need states.
9. **10+ distinct `font-mono` numeric colors on one page:** violet/indigo/emerald/cyan/amber each used for numbers/counters. Pro UI uses *ONE* primary numeric color (or primary-tinted) for KPIs, with a single accent color reserved for the ONE most-important metric per page.

### Files with the highest concentration of issues
- `globals.css`: `.card-interactive:hover` (colored shadow + indigo ring), `.ambient-glow` 3-color radial, `.badge-*` classes, `-webkit-scrollbar-thumb` violet-on-hover.
- `app/page.tsx`: Dashboard hero gradient + `blur-3xl` violet blob.
- `components/layout/Sidebar.tsx`: 12 matches. NowStudyingWidget dual gradient + glow blobs.
- `components/focus/PomodoroTimer.tsx`: 6 matches. Panel gradients, completion pulse neon tints, colored CTA shadows.
- `components/planner/HourlyTimeline.tsx`: 9 matches. Gradient now-line, `shadow-lg shadow-amber/60`, hover:scale event cards.
- `app/subjects/page.tsx`: 7 matches — degree filter pills all have colored tints.
- `app/chat/page.tsx`, `app/planner/page.tsx`, `app/upload/page.tsx`, `app/ai-manager/page.tsx`: hero gradients on each section header (page-level chrome doesn't need per-route gradient branding).
- All 6 modal dialogs: `AddSubjectModal`, `AddTaskModal`, `ProfileEditModal`, `ApiKeyModal`, `AiFlashcardModal`, `AiSearchModal` — every modal header has a tinted `bg-gradient-to-br` + `blur-2xl` inner blob.

## Files and Modules to Change

Global + shared:
- `frontend/src/app/globals.css` — rewrite `.card`, `.card-interactive` (neutral), kill `transform` on hover; tone `.ambient-glow` to ONE 4% wash; neutralize `.badge-*` to dot-only tint; standardize scrollbar.
- `frontend/src/app/page.tsx` (Dashboard) — hero card flat background, remove blur-3xl blob; tone metric card gradient headers.
- `frontend/src/components/layout/Sidebar.tsx` — NowStudyingWidget flat (remove inner blobs + double gradient), statuses use dot-only tint.
- `frontend/src/components/focus/PomodoroTimer.tsx` — flatten panels, remove `shadow-xl` on CTAs (except primary Play), kill completion-pulse neon border.
- `frontend/src/components/focus/AmbientPlayer.tsx` & `HourlyRings.tsx` & `DailyGoalRing.tsx` — tone subject-tinted rings, remove gradient tints from track backgrounds.
- `frontend/src/components/planner/HourlyTimeline.tsx` — flatten event cards, remove `hover:scale`, tone amber now-line to solid `bg-amber-400` (not gradient), remove `shadow-amber/60`.
- `frontend/src/components/subjects/SubjectCard.tsx` & `UnitListItem.tsx` — remove card-level gradients; use single ~3% top-tint bar instead of full gradient header.
- `frontend/src/components/subjects/DegreeFilter.tsx` — active pill gets ONLY indigo bg/ring (not violet gradient); inactive pills are neutral `bg-white/[0.04]`.
- `frontend/src/components/subjects/AddSubjectModal.tsx` — modal header flat; remove inner `blur-2xl` blob.
- All 6 modals: `AddTaskModal`, `ProfileEditModal`, `ApiKeyModal`, `AiFlashcardModal`, `AiSearchModal` — same pattern.
- Page headers: `app/planner/page.tsx`, `app/flashcards/page.tsx`, `app/upload/page.tsx`, `app/chat/page.tsx`, `app/ai-manager/page.tsx`, `app/subjects/page.tsx`, `app/subjects/[id]/page.tsx` — flatten section banner gradients to single neutral `card` with a 1px colored top-border stripe only.

## Implementation Steps

1. **`globals.css` reset (foundation first)** — do this one BEFORE touching any component; rest of the tree inherits from `.card`/`.card-interactive`/`.badge-*`. Rewrite:
   - `.card` neutral flat bg; radius fixed at 16px (no per-component overrides later); shadow soft black-only `0 1px 2px rgba(0,0,0,0.4)` + subtle `inset 0 1px 0 rgba(255,255,255,0.03)`.
   - `.card-interactive:hover` → no transform; border-color `rgba(99,102,241,0.25)`; background `var(--bg-elevated)`; elevation `0 1px 3px rgba(0,0,0,0.5)` only.
   - `.ambient-glow` → single `radial-gradient(55% 45% at 20% -10%, rgba(99,102,241,0.04) 0%, transparent 60%)` and nothing else.
   - `.badge-streak` / `.badge-mastered` / `.badge-urgent` → neutral base `bg-white/[0.03] text-slate-300 border-white/[0.08]` + colored `::before` w-1.5 h-1.5 rounded-full dot (not a full tint).

2. **Dashboard bento** (`app/page.tsx`) — hero: remove `bg-gradient-to-br from-violet-900/25 via-indigo-900/15 to-transparent` wrapper class, remove absolute `blur-3xl` violet blob; keep a single 2px `border-l-4 border-indigo-500/50` on the Smart Assistant badge as the only tinted accent.

3. **Focus widgets** (`focus/PomodoroTimer.tsx`, `focus/AmbientPlayer.tsx`, `focus/HourlyRings.tsx`, `DailyGoalRing.tsx`) — go card by card, remove inline `bg-gradient-to-br`; remove `shadow-*-500/*` on secondary buttons; keep ONE primary CTA (Play) with `shadow-lg shadow-indigo-500/15` max; replace any `animate-ping` + `animate-pulse` pair with a single static `w-1.5 h-1.5 bg-emerald-400 rounded-full` dot (live state is status enough).

4. **Layout chrome** (`layout/Sidebar.tsx`, `layout/Header.tsx`) — NowStudyingWidget: remove 2 nested inner gradient blobs (`absolute -top-8 -right-8 w-24 h-24 ... blur-2xl`), collapse base from `bg-gradient-to-br from-violet/15 via-indigo/10 to-transparent` → `bg-white/[0.03]` + `border-l-4 border-violet-400/50` (left-stripe accent only); sidebar nav-item active state from tinted gradient bg → `bg-white/[0.06] border-l-2 border-indigo-500/60` only.

5. **Planner + HourlyTimeline** (`planner/HourlyTimeline.tsx`, `app/planner/page.tsx`) — remove hover:scale event cards (keep border-color transition); amber now-line: `bg-amber-400` solid (not `from- via- to-transparent` gradient); remove `shadow-lg shadow-amber-400/60` on now-indicator dot (→ `ring-2 ring-base bg-amber-400` flat); page banner: replace per-page gradient hero bg with flat `card` + `border-t-2 border-amber-500/40` top stripe only.

6. **Subject explorer family** (`subjects/DegreeFilter`, `SubjectCard`, `UnitListItem`, `AddSubjectModal`, `app/subjects/page.tsx`, `app/subjects/[id]/page.tsx`) — SubjectCard header from tinted `via- to- gradient` → flat card with 1.5px `border-t border-<subjectColor>/50` on top only; DegreeFilter pills: active=indigo-500/20 bg + indigo-500/40 border, inactive=neutral white/4% bg white-8% border; detail page header: same top-stripe pattern (no full gradient); modals: kill inner gradient blobs.

7. **Remaining 4 pages (Chat / Upload / Flashcards / AI-Manager)** + 5 modals (`ProfileEditModal`, `ApiKeyModal`, `AiFlashcardModal`, `AiSearchModal`, `AddTaskModal`) — apply banner/modal pattern consistently: flat card bg, no `blur-*` inner overlays, single solid 2px top-border accent stripe colored per route brand, status uses dots not full tint.

8. **Design-system pass #2 (sweep step):** Re-run `rg` for remaining `bg-gradient-to-br`, `blur-2xl|blur-3xl`, `shadow-<color>-500/`, `hover:scale`, `animate-ping` matches across `frontend/src/**/*.tsx` and eliminate any residual cases from steps 1-7 being thorough but not 100% complete (grep-sweep at end is the catch-all — avoids regressions where a sub-component still has a leftover inline class).

9. **Radius standardization pass:** Grep + replace: all `rounded-3xl` on div cards → `rounded-2xl`; inputs stay `rounded-xl`; badge/pills = `rounded-full` (not rounded-lg + rounded-full mix). Keep Pomodoro progress ring rounded as-is (it's a circle, not chrome).

10. **Numeric color normalization:** Walk each page and make sure there is ≤1 violet/indigo-accented KPI per card, rest are `text-slate-300 font-mono` (not tinted). Exception: exam-countdowns <14 days can still show rose tint (high information density, not decoration).

## Dependencies and Considerations

- **Zero new packages.** This is pure CSS/Tailwind class rewrites — no `npm install`.
- **`globals.css` is the single source of truth.** Do NOT replicate `.card-interactive:hover` rules inside every component (that's how AI-rainbow effects happen — each component re-implements a slightly different tinted hover). Keep shared state in globals; components only add 1-2 *specific* accent stripes.
- **Subject color (`subject.color`) CANNOT be removed entirely from cards.** It's the primary visual anchor for 8 subjects being distinguishable in a 2-column grid. Permitted subject-color usage AFTER polish:
  - ✅ 2px top-border stripe on SubjectCard header
  - ✅ Tinted left-border (4px) on HourlyTimeline event blocks — *already the pattern* and it's the standard OS calendar pattern
  - ✅ Short `code` monospaced chip background (currently `backgroundColor: subjectColor + '20'`) — allow at opacity 0.10 max; reduce from current 0.20.
  - ❌ Any inner blur radial overlay inside a card using subject color
  - ❌ Full `bg-gradient-to-br from-<color>/20 via-<color>/10` as a card surface
- **Accessibility check:** keep text contrast ratios ≥ 4.5:1 for anything but mute-dot meta. Status dots remain visible but stop shouting.
- **All 8 modals share a wrapper `<div className="absolute top-0 ... bg-gradient-to-br ... blur-2xl">` inner header overlay — refactor by replacing that one 4-line snippet in *each* modal; identical pattern makes it copy-paste friendly.**
- **Route-level banners are almost copy-paste identical across 7 pages** — fix `page.tsx` route banner once in planner, use that as template for the other 6.

## Validation

1. **`npm run build` exit 0 in `frontend/`** — first gate after steps 1+2 (before writing any *single* component change after globals to catch class name typos).
2. **`GetDiagnostics` 0/0 clean** — run after each of steps 3/4/5/6/7 (since these touch `.tsx`).
3. **Visual grep regression sweep** after final code edits:
   ```
   cd frontend && npx -y tsm -e "void 0" || true  # nop just to confirm env ok
   cd frontend/src && rg "bg-gradient-to-br|blur-2xl|blur-3xl" --type tsx --count-matches
   ```
   Expected final count: **≤ 5 total matches** across all tsx (only used for things like Pomodoro progress-ring SVG fill, NOT div surfaces).
4. **Final `rg` for rainbow-shadow check:** `rg "shadow-(violet|indigo|emerald|cyan|amber|rose)[^/]*\/[0-9]+" --type tsx frontend/src` — expected **≤ 3 matches** (exactly the 3 *primary-CTA* buttons in the whole app: main Pomodoro Play, HourlyTimeline Start Session, Dashboard New Session).
5. **Dev server (already running on localhost:3000 PID 14084)** visual sanity pass: open 3 routes `/`, `/subjects`, `/planner` and compare before/after — confirm buttons click, text is readable, no layout reflow.

## Risks

- **Risk: Over-neutralizing kills brand personality.** *Handling:* Cap accent stripe count per page at 1× top-of-page brand stripe + per-subject 2px top border. Keep the single 4% ambient indigo wash in body. Never delete the subject-color system entirely — it's structural for 8-subject distinguishability.
- **Risk: Build-breaking class misnames after globals refactor (e.g. deleting `.glass-card`).** *Handling:* `.glass-card` is used 12+ files as alias. Keep in globals as alias pointing at new `.card` rules; never delete — backward compatibility only.
- **Risk: Modal inner overlay removal leaves ugly flat corners.** *Handling:* Replace the inner `blur-2xl` blob with a single `border-t-2 border-indigo-500/40` rounded-top-2xl stripe on the modal's header `<section>` so it still has a *tiny* chromatic break from the body panel — maintains hierarchy, no noise.
- **Risk: Pomodoro progress ring uses subject-color-tinted SVG filter; flatting text makes status unclear.** *Handling:* Keep progress-ring stroke color accent; just remove the outer `shadow-lg shadow-violet/20` wrapper DIV shadow. Ring itself IS the signal.
- **Risk: Sidebar now-studying live indicator gets too subtle after removing ping+pulse.** *Handling:* Keep it as a static `bg-emerald-400 rounded-full w-2 h-2` next to "◉ LIVE" text — the text label is actually higher-signal than animation; static doesn't cause epilepsy.
