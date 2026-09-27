# UI Professionalization (Student-Pro Grade) — Execution Plan

## Repository Research: Current State Grep Audit (17 Sep 2026)

### AI-made tells still present and counts

| Anti-pattern | Files matched | Lines hit | Severity |
|---|---|---|---|
| `bg-gradient-to-br` / `blur-2xl` / `blur-3xl` on div surfaces | 10 files | 17 hits | High — rainbowy page heroes & modal blobs on every route |
| `hover:scale-[1.00~1.02]` on buttons/cards | 5 files | 10 hits | High — productivity apps never scale chrome on hover (pixel misalign) |
| Colored `shadow-<color>-500/*` on everything (not just primary CTA) | 21 files | 42 hits | High — each page has 3-6 "primary" buttons screaming with neon shadows |
| `animate-ping` stacked + `animate-pulse` stacked on status dots | 9 files | 18 hits | Med — ping+pulse is AI catnip; actual live state should be ~1 ping/page max |
| `rounded-3xl` on regular cards (radius inconsistency) | 18 files | 28 hits | Med — 2xl=card, xl=input, full=pill is the pro standard; 3xl is fluffy |

### Root architecture

- `globals.css` `.glass-card` / `.card` aliases are in place but components **re-override** with inline gradient/hover classes instead of inheriting → this is why every card has a different tint.
- Subject color system (`subject.color`) is structural for 8-subject grid distinguishability — keep code chips + top-border stripes, **kill** inner radial `blur-*` overlays inside cards.
- Status badges currently have FULL tinted backgrounds (emerald-500/15 + emerald-500/30 border) → pro SaaS uses neutral base + small colored dot only.

## Files to Change (priority-ordered — 16 files, largest impact first)

**Foundation (1 file — do first):**
1. `frontend/src/app/globals.css` — `.card`/`.glass-card` radius → 16px/2xl equival; `.card-interactive:hover` → 0 transform, neutral elevation; `.ambient-glow` single 4% indigo wash; new `.badge-dot-*` classes (neutral + dot).

**Route heroes + banners (7 files — kill page-level gradient heroes):**
2. `frontend/src/app/page.tsx` (Dashboard) — hero flat, remove `blur-3xl` violet/cyan blobs; keep 2px colored top-stripe.
3. `frontend/src/app/subjects/page.tsx` — banner: remove `from-indigo-950 via-slate to-violet` gradient + 2 blobs; flat card + indigo top-stripe only.
4. `frontend/src/app/subjects/[id]/page.tsx` — detail header: flat card with subject-color top-stripe; remove inner overlay gradient.
5. `frontend/src/app/planner/page.tsx` — top banner flat + amber top-stripe; remove `from-rose via-amber` hero gradient.
6. `frontend/src/app/chat/page.tsx` — header flat with indigo top-stripe.
7. `frontend/src/app/upload/page.tsx` — banner flat with cyan top-stripe; kill inner gradient panel.
8. `frontend/src/app/ai-manager/page.tsx` — both banner cards flat; `from-violet via-indigo` hero → violet top-stripe only.
9. `frontend/src/app/flashcards/page.tsx` — banner + empty-states flat; emerald completion card uses dot + left-stripe not full gradient bg.

**Layout chrome (2 files — nav/sidebar):**
10. `frontend/src/components/layout/Sidebar.tsx` — NowStudyingWidget: remove 2 nested `blur-2xl` inner blobs + `from-violet/15 via-indigo/10` base → `bg-white/[0.03]` + `border-l-4 border-violet-400/50`; nav active state from tinted gradient → `bg-white/[0.06] border-l-2 border-indigo-500/60`; brand icon keep gradient (that's logo, allowed 1 place).
11. `frontend/src/components/layout/Header.tsx` — pulse+ping on notifications → static dot (ping is noise).

**Focus widgets (2 files — Pomodoro / rings):**
12. `frontend/src/components/focus/PomodoroTimer.tsx` — panels flat; secondary CTAs remove colored shadow (only primary Play keeps soft `shadow-indigo/15`); completion-pulse border remove (text pulse is enough info).
13. `frontend/src/components/focus/HourlyRings.tsx` — amber pulse dots → static (label is enough).

**Planner (1 file):**
14. `frontend/src/components/planner/HourlyTimeline.tsx` — remove hover:scale on event cards; now-line solid amber not gradient; now-dot remove `shadow-amber/60` → `ring-2 ring-base bg-amber-400`; CTA button remove `shadow-xl shadow-violet/30` + hover:scale.

**Subjects family (3 files — DegreeFilter + SubjectCard + AddSubjectModal):**
15. `frontend/src/components/subjects/SubjectCard.tsx` — header top-accent stripe stays (it's subject-color structural); card hover removes any scale; status pills → neutral base + dot.
16. `frontend/src/components/subjects/DegreeFilter.tsx` — active degree pill from `bg-gradient-to-r from-indigo to-violet shadow-md shadow-indigo/25` → `bg-indigo-500/20 border-indigo-500/40 text-indigo-200` (no gradient shadow).
17. `frontend/src/components/subjects/AddSubjectModal.tsx` — color swatches remove `hover:scale-110` (→ border highlight only); submit CTA drop `shadow-lg shadow-indigo/25` + `hover:scale-[1.02]`.

**Modals sweep (4 files — copy-paste header overlay pattern):**
18. `frontend/src/components/planner/AddTaskModal.tsx` — overlay gradient if any → `border-t-2 border-amber-500/40` stripe.
19. `frontend/src/components/profile/ProfileEditModal.tsx` — same.
20. `frontend/src/components/ai/ApiKeyModal.tsx` — same, remove primary button colored shadow *except* submit.
21. `frontend/src/components/search/AiSearchModal.tsx` — remove `animate-pulse` on icon (loading is different from "look alive"); header flat.

## Implementation Steps (dependency order)

1. **`globals.css` foundation (Step 1 — 15 min)**
   - Keep `.glass-card` as alias (backward compat — 12 files use it). Point at: `border-radius:16px`, bg surface@90%, shadow `0 1px 2px rgba(0,0,0,0.4) + inset 0 1px 0 rgba(255,255,255,0.03)` flat.
   - `.card-interactive:hover` → NO transform; only `background: elevated`, `border-color: rgba(99,102,241,0.22)`, `box-shadow: 0 1px 3px rgba(0,0,0,0.5)`.
   - `.ambient-glow` → single `radial-gradient(55% 45% at 20% -10%, rgba(99,102,241,0.04) 0%, transparent 60%)` — no cyan, no violet corners competing.
   - Add 3 reusable `.badge-dot-streak` / `.badge-dot-mastered` / `.badge-dot-urgent` classes: `bg-white/[0.03] border-white/[0.08] text-slate-300` with a colored `::before` dot only.

2. **Build check after globals reset** → `cd frontend && npm run build` exit 0. Must pass before touching components (class name typo gate).

3. **Route banner pass (8 files — copy-paste same template)**
   - For each `*page.tsx`: find the top `<section className="relative overflow-hidden rounded-3xl glass-card bg-gradient-to-br ...">` banner hero.
   - Replace pattern: `rounded-3xl` → `rounded-2xl`; remove `bg-gradient-to-br from-X via-Y to-Z`; remove 1-2 `<div className="absolute ... blur-3xl pointer-events-none">` inner blob children; ADD a `border-t-2 border-<routeColor>/40` (indigo for subjects, amber for planner, cyan for upload, violet for ai-manager, emerald for flashcards).

4. **Sidebar + Header layout (2 files)**
   - NowStudyingWidget wrapper `bg-gradient-to-br from-violet/15 via-indigo/10 to-transparent` → `bg-white/[0.03] border border-violet-500/20 border-l-4 border-l-violet-400/50`; DELETE inner `absolute -top-8 -right-8 w-24 h-24 ... blur-2xl` blob.
   - Sidebar nav-item active `bg-violet-500/20 ... shadow-lg shadow-violet/20` → `bg-white/[0.06] border-l-2 border-l-indigo-500/60` (no shadow, no tint bg).
   - Header notification ping → static dot.

5. **Focus widgets (Pomodoro + HourlyRings)**
   - Only the PRIMARY CTA (big Play button) may have a colored shadow and it caps at `shadow-indigo-500/15` (not /30).
   - All secondary buttons (Reset, settings toggles, mode switch) → remove colored shadow entirely.

6. **Planner HourlyTimeline**
   - Event block class list from `hover:scale-[1.005] hover:-translate-y-0.5 hover:shadow-2xl` → keep only border-color hover.
   - Now-line indicator: `bg-gradient-to-b from-amber to-transparent` → `bg-amber-400` solid; now-dot remove `shadow-lg shadow-amber/60`.
   - Bottom-right CTA: drop `shadow-xl shadow-violet-600/30` + `hover:scale-[1.02]`.

7. **Subjects family (3 files)**
   - DegreeFilter active pill: remove gradient + colored shadow → `bg-indigo-500/20 border-indigo-500/40 text-indigo-100`.
   - SubjectCard top accent stripe *stays* (1.5px solid subject color on `<div className="h-1.5 w-full">` — that's the per-card visual anchor already in place).
   - AddSubjectModal submit: drop `shadow-lg shadow-indigo/25` + `hover:scale-[1.02]`.
   - Color swatches `hover:scale-110` → replace with `border-2` ring highlight.

8. **Modal header sweep (4 files)**
   - Find the header overlay `<div className="absolute top-0 ... bg-gradient-to-br ... blur-2xl">` pattern if present (varies). Replace with a simple `border-t-2 border-<color>/40 rounded-t-2xl` stripe.
   - AiSearchModal loading icon pulse → remove (animation reserved for actual streaming).

9. **Radius consistency sweep**
   - Bulk find+replace: card `<div>` elements with `rounded-3xl` → `rounded-2xl`. EXCEPTIONS allowed:
     - `Flashcard3D` (3D flip cards keep their own radius — it's part of the card art).
     - Modal dialogs (max-w-lg wrappers keep 3xl? → no, standardize to 2xl too, pro apps don't use 24px radius on dialogs... keep 3xl only if design feels cramped — judgment call during implementation).

10. **Final grep regression sweep (critical catch-all)**
    - `rg "bg-gradient-to-br|blur-2xl|blur-3xl" frontend/src --glob *.tsx --count-matches` → expect ≤ 5 matches (remaining are logo icon gradients not surfaces).
    - `rg "hover:scale|scale-\[1\." frontend/src --glob *.tsx --count-matches` → expect ≤ 3 matches (color swatch scale ok → convert those during step 7, so target = 0).
    - `rg "shadow-(violet|indigo|emerald|cyan|amber|rose)[^/]*\/[0-9]+" frontend/src --glob *.tsx --count-matches` → expect ≤ 5 (exactly the 5 REAL primary CTAs in whole app: Pomodoro Play, Planner New Session, Dashboard New Session, Subjects Add, AI-Manager Connect).

11. **Final build + diagnostics**
    - `npm run build` exit 0.
    - `GetDiagnostics` on all touched files → 0/0.

## Dependencies and Considerations

- **Zero packages.** Pure Tailwind class rewrites + a small CSS class addition in globals.css.
- **Subject color is NOT removed from SubjectCard** — the h-1.5 top stripe + the monospaced `code` chip use it; those are info-bearing structural distinctions for 8 subjects in a 2-col grid. Remove only inner `blur-*` overlays and full-gradient card surfaces.
- **Brand logo icon (`bg-gradient-to-br from-[#7C3AED] to-[#6366F1]`) in Sidebar header + Profile avatar placeholder** are allowed gradients (they are logo/identity marks, not UI surfaces).
- **Accessibility:** Keep text contrast ≥ 4.5:1. Changing badge tints from `emerald-500/15 bg + emerald-300 text` → `white/3 bg + slate-200 text + emerald dot` actually raises contrast because slate-200 is lighter than emerald-300.
- **Ping+pulse tolerance:** Allow `animate-pulse` *only* on 1) the cursor in chat streaming (classic text-editor caret) and 2) the single Pomodoro completion celebration pulse *during* completion state (not always-on). Everything else: static dots.

## Validation

1. After Step 1 (globals only): `cd frontend && npm run build` — must pass (0 TS errors, 0 Next build errors) — this is the foundation gate before writing component edits.
2. After each route/component edit batch, `GetDiagnostics` 0/0 clean.
3. Final visual regressions (grep counts hard targets):
   - `bg-gradient-to-br` / `blur-2xl` / `blur-3xl` on div surfaces: **≤ 5 hits** (logo marks only, not page chrome).
   - Colored `shadow-<color>-500/*` hits: **≤ 5 total** (only true primary CTAs).
   - `hover:scale` / `scale-[1.*`: **0 hits** on interactive chrome (color swatches can use border highlight instead).
   - `animate-ping` **≤ 1 match per page** (no stacking ping+pulse together except chat cursor).
4. Final `npm run build` exit 0.

## Risks

- **Risk: Over-neutralizing leaves routes visually identical (no route identity).** *Handling:* Each route banner gets a unique 2px top-border color stripe (planner=amber, subjects=indigo, upload=cyan, ai-manager=violet, flashcards=emerald, chat=indigo, dashboard=indigo). Accent stripes are the pro-SaaS method for section identity (Notion/Linear do this), not gradient-blob heroes.
- **Risk: Build break from deleting a global CSS class still referenced.** *Handling:* `.glass-card` alias is KEPARET (kept in place pointing at same rules). `.card-interactive` kept same name. Only ADD `.badge-dot-*` new classes; never delete existing classes.
- **Risk: Radius shrink (3xl → 2xl) makes modals feel cramped.** *Handling:* Keep modals at 3xl if they feel tight during visual pass — modals are modal chrome, not in-flow cards; flexibility allowed as long as *cards inside pages* are consistent at 2xl.
- **Risk: Subject distinction loss after removing inner gradient tints.** *Handling:* SubjectCard already has a `h-1.5 w-full` top stripe + a code chip with `subjectColor+'20'` background — combined with the title; 3 signals. Reduce chip opacity from current `+'20'` to `+'10'` (softer) but keep the tint because it's info-bearing.
- **Risk: Grep counts in step 10 fail because of missed spots.** *Handling:* Step 10 is literally the grep sweep with explicit targets — after the 8 route banners + sidebar + planner + subjects + modals pass through specific edits, any remaining hits are edge cases caught and fixed at step 10.
