# Miami Vice direction — research brief

**Date:** 2026-08-02
**Brief:** the app should read as *Miami Vice* — fonts, colours, mood — and it must not read
as AI-generated. Anchor reference supplied by the client: Christopher Dewan's
[Project Vice](https://dewanism.com/project-vice/), a "Miami Vice UI System."
Deliverable: this document. It does **not** change any code.

Read alongside [DESIGN_REVIEW.md](DESIGN_REVIEW.md), which sets the anti-slop standard this
has to satisfy, and [CLAUDE.md](CLAUDE.md) for the shipped Tropical Deco tokens and the lint floors.

---

## 0. The finding, up front

**The two goals are in direct tension, and the reference is on the wrong side of it.**

Project Vice is a well-executed piece of work, but measured against *our own* slop catalogue it
is close to a full house: neon-on-near-black, cyan-and-magenta, glassmorphism, gradient borders,
a purple→cyan hero gradient, ~50 glow shadows, and **Space Grotesk** — the one typeface
[DESIGN_REVIEW.md §M5](DESIGN_REVIEW.md) already singled out as an AI default. If we copy the
reference token-for-token we ship, by our own lint, maximal slop.

The resolution is not "reject Miami Vice." It is that **the reference confuses the *cliché* of
Vice with the *thing itself*.** The historical Vice look was **subtractive** — a ban list, a
near-white field, saturation confined to signage. That version is period-correct, it is
*more* Miami, and it survives every test in `design-lint.mjs`. This brief keeps the reference's
best idea — its **AM/PM dual-mood system** — and rebuilds the execution on the restrained side.

One nuance worth stating because it changes the argument: the reference's neon is **not an
accessibility failure**. Its magenta clears 7:1, its cyan clears 13:1 (measured below). The
deficit is entirely *originality*, which is exactly the Romero et al. result cited in the
existing review — AI interfaces test fine on usability and fail only on "Conventional/Inventive."
So the case against copying it is aesthetic, not a WCAG card. Argue it on those terms.

---

## 1. The reference, measured

Pulled straight from `dewanism.com/ViceStyles.css`. It ships two themes toggled by an AM/PM
switch — the genuinely good idea here.

### Concept (the reference's own words)

> "A neon-infused interface system tuned for sunrise pastels and afterdark chrome."
> "Two moods, one system." "Flip between AM and PM to change the mood."

Framed as a night drive: calm morning scenes, electric night scenes. Sections are *Runway,
Palette, Lookbook, Build Kit*; the lookbook scenes are named *Ocean Drift, Palm Shadow,
Skyline Pulse, Chrome Night*. The mood-toggle and the scene-naming are the parts worth stealing.

### Tokens

| | **PM — Afterdark** | **AM — Sunrise** |
|---|---|---|
| Field | `#06070f` near-black | `#f6f9ff` blue-white |
| Text | `#f7f7ff` | `#1b2230` |
| Neon 1 | `#ff4fd8` magenta | `#ff6fb3` soft pink |
| Neon 2 | `#63e0ff` electric cyan | `#4cc8ff` soft cyan |
| Panel | `rgba(12,10,22,0.55)` — glass | `rgba(255,255,255,0.99)` |
| Hero gradient | `rgba(80,30,140)` → magenta → cyan (purple→cyan) | pink → cyan |

- **Display / headings:** `Space Grotesk`
- **Serif accent:** `Playfair Display`
- **Body:** system sans (`-apple-system…`)
- **Effects:** `backdrop-filter` glass (10 sites), **~50** `box-shadow`/`text-shadow` glows,
  gradient borders, "slow glow sweeps, subtle shimmer."

### Measured contrast (so nobody argues the wrong point)

| Pair | Ratio | |
|---|---|---|
| PM magenta `#ff4fd8` on `#06070f` | **7.04** | passes 7:1 |
| PM cyan `#63e0ff` on `#06070f` | **13.05** | passes |
| PM text `#f7f7ff` on `#06070f` | **18.85** | passes |

The reference is accessible. It is not original. Keep those two sentences separate.

---

## 2. Where it collides with our slop catalogue

Every row here maps a reference technique to a tell already documented in
[DESIGN_REVIEW.md](DESIGN_REVIEW.md) or enforced by `design-lint.mjs`.

| Reference technique | Our catalogue says |
|---|---|
| `#63e0ff` cyan on `#06070f` | Anthropic frontend-design cluster two, verbatim: *"a near-black background with a single bright acid-green or vermilion accent."* Impeccable: *"cyan-on-dark … most recognizable tells of AI-generated UIs."* |
| Purple `rgba(80,30,140)` → cyan hero gradient | Impeccable: *"Purple/violet gradients … most recognizable tells."* |
| `backdrop-filter` glass panels | Named tell; also our own Minor finding (backdrop-filter without a reduced-transparency fallback). |
| ~50 glow shadows, "shimmer," "glow sweeps" | Direct violation of our load-bearing rule: **"Hard shadows, never glow."** The Deco device is a 6px offset slab, zero blur. |
| **Space Grotesk** | Already caught once. §M5: *"On every AI-default font list."* |
| Playfair Display display-serif | Adjacent to the Instrument-Serif tell of the 2025–26 fingerprint. |
| Rounded glass cards everywhere | Impeccable: *"rounds everything into the same soft blob."* |

Run the reference's three questions against itself:

1. **Genre test** — swap the restaurant data for a crypto dashboard or a synthwave album page.
   It still "works." That is the diagnosis: the palette fits any subject, so it identifies none.
2. **Subject test** — the moves trace to a *trend* (synthwave/vaporwave neon), not to Miami's
   own materials. Terrazzo, glass block, neon *tubing as signage*, marine stucco — none present.
3. **Removal test** — there is no single signature; glow, glass, gradient and neon all shout at
   once. Chanel's rule (take one thing off) has nothing to remove because nothing is quiet.

---

## 3. What's genuinely worth keeping

Don't throw the reference out. Three ideas survive:

1. **The AM/PM dual-mood system.** "Two moods, one system" is a strong, on-brand concept for
   a directory used morning-to-night, and it maps to real user context (booking brunch vs.
   booking a late dinner). Keep it. Our current app is AM-only; a restrained PM is the addition.
2. **The cinematic, place-named scenes.** *Ocean Drift, Palm Shadow, Skyline Pulse, Chrome
   Night* — naming the moods after Miami scenes is good copy and good structure. Cheap to adopt.
3. **The AM side is already 80% right.** The reference's AM field is near-white (`#f6f9ff`),
   pastel-as-accent, "breathable spacing for morning calm." That is *our* thesis almost exactly
   (§4 of the review: "the pastel is the paper, not the ink"). Its AM mode and our shipped
   Tropical Deco are cousins; its PM mode is where it defects to slop.

---

## 4. What real Miami Vice actually looks like

The reference reaches for the Instagram version. The archive says something more usable, and it
lines up with the standard we already adopted.

- **The title face is Deco, not neon-script.** The *Miami Vice* logo is set in **Broadway**
  (Morris Fuller Benton, 1927–28) — a geometric Art Deco display face — in cyan + pink over a
  dark slate, with the palm silhouette behind. The period-correct Vice typographic reference is
  **Deco geometry**, which is the lineage our shipped **Jost** (Futura, 1927) already sits in.
  Broadway itself is too costume-y for UI text but could cameo in a wordmark.
- **Vice's colour rule was a ban list.** Michael Mann: *"No earth tones, no red."* Costume
  designer Jodie Tillen: *"no earth tones, no primary, all pastel."* The look is **subtractive**
  — you get the Vice palette by *removing* colours, then letting a little saturation sit against
  a near-neutral field. That is the flamingo-for-price-only rule we already ship.
- **The pastel is the paint, not the light.** Miami Beach's historic district is a near-white,
  low-chroma field by regulation; the colour lives in neon tubing, awnings, terrazzo — a small
  fraction of visual area. Neon as **signage over a pale field** is the authentic move. Neon as
  the **entire field** is the tourist poster.

Corroboration already in the review: Poolsuite (the most successful 80s-Miami site) ships **no
neon and no sunset gradient**; the Wolfsonian (the Deco museum) uses **contemporary neutral
type**. Expertise in the era produces restraint.

**Conclusion:** a faithful Vice interpretation and our anti-slop standard are the *same target*.
The reference is the one pulling away from it.

---

## 5. Proposed direction — "Vice AM / Vice PM," reconciled

Keep the reference's dual-mood idea; rebuild both moods on the restrained side. AM stays our
shipped, lint-clean Tropical Deco. PM is a **true night mode done as Deco-at-night**, not neon-
on-black: a deep marine-indigo field, near-white text, and the two Vice hues used as **signage
and price only** — low area, hard edges, no glow.

### Type — drop both reference faces

| Role | Use | Why |
|---|---|---|
| Display / UI | **Jost** (shipped) | Futura lineage, period-correct Deco, not on any AI-default list. |
| Data | **IBM Plex Mono** (shipped) | Tabular, already in use. |
| Optional wordmark cameo | a real Deco face (e.g. a Broadway-adjacent display), **one place only** | Vice logo lineage without dragging a costume face into body text. |

No Space Grotesk. No Playfair. The four-step scale (12/15/19/44) does not change.

### Colour — Vice PM (proposed), measured against our floors

Field derived by darkening the shipped `--marine #12414c` toward night, not inventing a new hue.

| Token | Hex | On PM field | Verdict |
|---|---|---|---|
| `--pm-field` | `#0e1a1f` | — | deep marine-black, not `#000` |
| `--pm-ink` | `#f2f4ee` | **15.98:1** | body text |
| `--pm-soft` | `#9fb0ac` | **7.82:1** | clears Apple's 7:1 small-text target |
| `--pm-cyan` | `#7fe3ef` | 11.92:1 | **structure / large only** (the Vice cyan, toned) |
| `--pm-flamingo` | `#ff6fae` | 6.86:1 | **price only** (the Vice pink; clears AA for large) |

AM stays exactly as shipped (`--paper #e9e6de` … `--flamingo #9c1e45`), already verified in
`verify.mjs`: worst pair 6.27:1, every pair clears AA.

The trick that keeps PM out of the slop bucket: the neon hues appear on **≤5% of pixels**
(price, one hairline of structure), never as the field, never behind text, never blurred.
That is Miami's actual light budget — signage, not sky.

### Depth & motion — unchanged from the standard

- **Hard offset shadow, zero blur** (`--eyebrow: 6px 6px 0`). In PM the eyebrow tints toward
  cyan at low alpha. **No glow, no shimmer, no glow-sweep** — the single biggest visual
  departure from the reference, and the one that does the most work.
- Motion stays honest under `prefers-reduced-motion`. No "slow glow sweeps."
- The AM/PM toggle mirrors the reference's best feature; default is **AM**, matching the shipped
  theme and the light-basemap requirement noted for the Phase 2 map.

### Motifs to add (all 2D-portable, all non-glow)

Racing stripes (shipped), plus: a hairline **cyan/flamingo rule pairing** under section heads
(the Vice two-tone, as line not fill); **place-named moods** borrowed from the reference
(*Ocean Drive* AM / *Chrome Night* PM); optional **terrazzo speckle** as a near-invisible
texture on the PM field only. Rule of three throughout.

---

## 6. What this costs — decisions that are yours, not mine

Per CLAUDE.md: *"If you disagree with a lint rule, edit the rule and say why. Do not work around it."*
So the choices are explicit.

1. **Faithful-to-reference vs. lint-clean.** A literal Project-Vice PM (neon field, glass, glow,
   Space Grotesk) would trip `SLOP/gradient`, the glow ban, `cyan-on-dark`, and the font rule.
   Shipping it means **editing `design-lint.mjs` to retire those rules and writing down why** —
   i.e. formally deciding the app is allowed to look like the reference. My recommendation is to
   **not** do that; the restrained PM above gets ~90% of the Vice feeling and keeps the lint green.
2. **Scope.** PM mode is a real build: a second token set, a toggle with persistence, a QA pass
   on every contrast pair, and lint/verify updates. It is a Phase-2-sized effort, adjacent to the
   map work, not a quick reskin.
3. **The wordmark cameo.** A Broadway-adjacent display face in the wordmark is the one place a
   literal Vice quote is safe. Anywhere else it reads as costume. This is a taste call — flag if
   you want it.

If you want, the next step is a **specimen** (as was done for Tropical Deco): build
`app/specimen/vice-pm.html` with the proposed PM tokens so it can be judged in the flesh and run
through `design-lint.mjs` before a line of app code changes.

---

## Sources

**Reference:** [Project Vice — Christopher Dewan](https://dewanism.com/project-vice/) ·
`dewanism.com/ViceStyles.css` (tokens quoted above).

**Miami Vice type & palette:**
[Which Font Was Used in the Miami Vice Logo? — Writing Beginner](https://www.writingbeginner.com/which-font-was-used-in-the-miami-vice-logo/) ·
[Miami Vice fonts — MyFonts](https://www.myfonts.com/pages/tags/miami%20vice-fonts/) ·
(Broadway, Morris Fuller Benton; cyan/pink over dark slate.)

**Slop catalogue & Miami restraint** — all already collected in
[DESIGN_REVIEW.md §Sources](DESIGN_REVIEW.md): Krebs, Bakaus/Impeccable, Nutlope/Hallmark,
Anthropic frontend-design, Romero et al.; City of Miami Beach paint palette, MDPL, Poolsuite,
The Wolfsonian; Mann/Tillen oral histories.
