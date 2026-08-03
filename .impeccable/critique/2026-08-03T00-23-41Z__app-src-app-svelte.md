---
target: the entire UI + Miami Vice theme; surface meal/dish notes
total_score: 37
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
timestamp: 2026-08-03T00-23-41Z
slug: app-src-app-svelte
---
Method: dual-agent (A: general-purpose · B: general-purpose)

## Design Health Score — 37/40 · Excellent

| # | Heuristic | Score | Key issue |
|---|-----------|-------|-----------|
| 1 | Visibility of system status | 4 | aria-live count, live facet counts, chips, copy-confirmation |
| 2 | Match system / real world | 3 | Menu lists dish NAMES only — no description of what the dish is |
| 3 | User control & freedom | 4 | Chips, Clear all, undoable shortlist clear, wordmark=Home |
| 4 | Consistency & standards | 4 | iOS idioms held; minor verb drift (Pick one for us / Pick another) |
| 5 | Error prevention | 4 | Disable-not-remove; relaxation suggestions before dead end |
| 6 | Recognition over recall | 4 | Inline counts, applied-state chips, teasers |
| 7 | Flexibility & efficiency | 4 | URL state, shareable search, shortlist, presets, Pick-for-us |
| 8 | Aesthetic & minimalist | 4 | Strong restraint; soft spot = figure-dense row right-rail |
| 9 | Recognize/recover errors | 4 | Empty state offers labeled Drop-X relaxations with counts |
| 10 | Help & documentation | 3 | Filter-combination logic never explained |
| Total | | 37/40 | Excellent |

## Design Specificity Verdict
Authored for this product but the "Vice" half is a whisper. Load-bearing decisions are product-specific (rows-not-cards at density, day×meal ScheduleGrid, palette-by-exclusion, decision-paralysis scaffolding). But the hard Apple-restraint commitment means it reads as a well-made dark Apple app at a glance; the Miami Vice soul lives in two sparingly-used hues. Specific in authorship, quiet in personality.

Deterministic scan: Impeccable detector [] (0 findings) across 8 components; design-lint 0 critical/0 major/0 minor, 0 slop tells, density 8.7/900px; verify 23/23 PASS. Mechanically immaculate. (verify's "soft on paper 4.66" reads the dormant light-base token, not the shipped night theme, where soft clears 7:1.)

## Overall Impression
Excellent, disciplined build — top of class on IA, a11y, restraint. Biggest opportunity: the app defeats decision paralysis at the front door then recreates it inside every expanded row, because the menu shows dish names with no description.

## Priority Issues

[P1] Menu shows dish names, never what dishes are. prepare_data.py line 199 builds items from i["dish"] only, dropping the per-dish note present on 6,409/7,108 dishes (90.2%). CourseLadder lists bare names; undercuts the "deeper menu than official" positioning at the decision moment. Proof-in-panel: some dish fields contain descriptions, so dinner desserts showed rich text inches above brunch bare names. Fix: carry note through prepare_data.py; render in CourseLadder as a muted secondary line or tap-to-reveal per dish. Command: /impeccable clarify or new-work on CourseLadder.

[P2] Dish separators invisible. CourseLadder .sep is --hair (#21343b) on --card (#16262c), below legible contrast; "Hummus · Stracciatella" reads run-on. Fix: raise .sep to --soft/--rule or spaced wrapped list. Command: /impeccable polish.

[P3] Filter-combination logic never explained. day+meal rule and AND-across-facets invisible. Fix: helper line under DayMealGrid + About note. Command: /impeccable clarify.

[P3] Row right-rail figure-dense, competes with price anchor. Long mono offer string next to flamingo pill. Fix: collapse closed-state line to primary offer; grid carries full matrix. Command: /impeccable layout.

[P3] "Vice" nearly inaudible + hero-image peak fragile (onerror removes it). Fix: one authored lint-safe Vice moment + CSS fallback tile. Command: /impeccable delight or bolder.

## Persona Red Flags
- Jordan (first-timer, cold link): lands mid-filter unexplained; expands row and gets undescribed names.
- Casey (mobile): results bar wraps; long expanded panels end in undescribed dishes; high cost of tapping out to confirm.
- Sam (a11y): mostly strength (aria-live, sr-only, focus mgmt, table semantics, legend, 44pt, reduce-motion). Narrow: disabled options opacity 0.4 may fall below 3:1; teaser nowrap+ellipsis hides dish info from all.

## Minor Observations
- "Il Pastaio di Eataly" appears twice consecutively in Italian results (data dup visible to users).
- Supplements leak into dish names ("Raviolini al tartufo (+35)").
- Verb drift: Pick one for us / Pick another / Tonight's pick.
- Discover 6 simultaneous lanes (~30+ tiles cold) = biggest cold-start load.

## Questions to Consider
1. If flamingo is price-only, is the scarcest ink pointing at the least-differentiating fact? Should the accent point at the dish?
2. Front door defeats paralysis, then the menu view reintroduces it — same problem?
3. What would a Vice-forward, lint-safe moment look like?
