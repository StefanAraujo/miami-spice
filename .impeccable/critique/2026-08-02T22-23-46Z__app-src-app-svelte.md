---
target: app/src/App.svelte
total_score: 38
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
timestamp: 2026-08-02T22-23-46Z
slug: app-src-app-svelte
---
Method: dual-agent (design review + detector evidence, isolated)

## Design Health Score — 38/40 · Good→Excellent — up from 36 (was 32)

All 10 heuristics: 1,2,4,5,6,7,8,9,10 mostly 4; H3 Control & Freedom = 3; H10 Help = 3. Total 38/40.
Movement from 36: #4 Consistency ↑ (two-letter day picker now matches the grid; removing the AM/PM toggle erased a parallel mode) and #10 Help ↑ (persistent "About" reopen + grid legend). H3 held at 3 by the destructive Shortlist "Clear."

## Design Specificity Verdict
Top-decile specific — the opposite of template slop. Fully committed sourced design language ("Ocean Drive After Dark"): zero-blur Deco eyebrow depth, one saturated object per screen (price chip), five type steps, two uppercase roles. Night-only is now a decision, not a half-toggle. Both detectors: 0 findings / 0 slop tells / density 8.5. All this round's changes verified live.

## Priority Issues
[P2] Shortlist "Clear" is destructive, no undo — the group-decision primitive is wiped in one tap. Fix: undo toast (stash + "Undo" for ~6s).
[P3] Doc drift — PRODUCT.md still lists the AM/PM toggle; DESIGN.md Overview/Components still describe it; a stale App.svelte comment remains. Fix: sync to night-only.
[P3] View-change gives no focus/announcement — clicking "Pick for us" leaves focus on the unmounted button; sr-only heading isn't focused. Fix: focus the view heading + scrollTo(0).

## Minor
- The reasoned pick still random-draws from the top 15 then justifies that choice — defensible, but "confident single choice" would pick #1.
- Night-only vs a noon-brunch decision is a mild brand tension (deliberate).
- Wordmark-as-Home discoverability rests on a hover cue + title.

## Strengths
1. Identity through discipline — night-only recolours by token name, restraint holds everywhere.
2. Decision-first IA — Discover → reasoned Pick → shortlist → shareable link.
3. Honest facts as trust — accurate day×meal grid + legend, dish counts, deep-links out for ratings.
