# Miami Spice — UX & decision-psychology review

**Date:** 2026-08-02
**Question asked:** run a thorough review + market research on the best "where should we go out?"
products, do a psychological analysis, and find the gaps that keep our UI from feeling *nice,
appetizing, and easy to decide with*.

This fuses three independent passes — a heuristic self-audit, a market teardown of 14 going-out
products, and an 18-principle psychology catalog grounded in our actual code. All three landed on
the **same** thesis, which is the reason to trust it.

---

## 0. The thesis, in one line

> **Miami Spice has essentially *won* the cognitive-efficiency half of the problem and is nearly
> empty on the affective + social half. The austerity that makes it a superb *tool* makes it an
> incomplete instrument for a decision that is, at its core, about *desire and other people*.**

Everything below is a consequence of that sentence.

---

## 1. The real job-to-be-done

We built the app to answer *"which restaurants match these facts?"* The human actually arrives with
*"where should **we** go tonight — somewhere I'll feel good about?"* That question is:

- **Hedonic** — the thing being maximized is anticipated *pleasure*, not correctness. Appetite and
  desire, not accuracy, drive it.
- **Social** — it's almost always decided *with* someone ("I dunno, where do *you* want to go?").
- **Emotionally loaded** — nobody wants to be the one who picked the disappointing spot; the felt
  stakes are social approval and regret-avoidance.

Judged against *that* job — not against "flight search" — our strengths and gaps sort cleanly.

---

## 2. Scorecard — two axes

Using Norman's three levels of emotional design (*Emotional Design*, 2004):

| Level | What it is | Miami Spice |
|---|---|---|
| **Behavioral** | pleasure of *use* — speed, flow, function | **Excellent.** Keyless, ~1ms in-memory queries, honest interdependent facet counts, no dead ends (`relaxations()`), rows-not-cards density. |
| **Reflective** | the *story* you tell about the choice / self-image | **Strong.** The Deco-at-night craft and "unofficial, made-with-care" positioning give a tasteful story. |
| **Visceral** | pre-conscious sensory pull — *"that looks delicious"* | **Near-empty.** A monochrome text ledger for an appetite-led decision. |

The **cognitive-efficiency** principles are close to exemplary and need no work:
Hick's Law (the whole IA is a decision tree), Cognitive Load (no ads/carousels/glow — the anti-slop
discipline *is* extraneous-load reduction), Fitts's Law (44pt floor enforced; the whole row is the
target), Gestalt grouping (tight `meta` chunks, layer-cake scan), Miller/chunking (`dayRange()`
collapses "Mon,Tue,Wed,Thu"→"Mon–Thu"), and live facet counts (recognition over recall).

**Every remaining high-leverage gap lives on the affective + social axis:** appetite (visceral),
trust (social proof), memory/convergence (shortlist), commitment (default + group flow), and value
framing. That is the entire finding.

---

## 3. What the best "going out" products actually sell

Teardown of OpenTable, Resy, Yelp, Google Maps, The Infatuation, Eater, Time Out, TheFork, DoorDash,
Tock, Fever, Beli, Partiful, Airbnb. The reframe that matters:

> **Every review-heavy competitor is really selling *confidence*. Reviews are just one way to
> manufacture it — and not even the way users most trust.**

Load-bearing patterns, and what a keyless / no-reviews / no-photos / no-login directory can borrow:

- **Named, finite, human-titled lists beat sortable tables.** The Infatuation's ["Perfect For"
  tags](https://apps.apple.com/us/app/infatuation-restaurant-reviews/id465685575) (Date Night, Girls'
  Night), [Eater's "38 Essential"](https://www.barvlaha.com/press/eater-boston-the-38-essential-restaurants-in-boston),
  [Resy's monthly "Hit List"](https://blog.resy.com/category/the-hit-list/), Time Out's declared
  [**#1**](https://www.timeout.com/miami/news/miami-has-a-new-number-one-restaurant-according-to-time-out-031725).
  A *fixed number* signals editorial confidence and caps overload. → We can title our mood/occasion
  scores as lists ("The Spice 20 for date night"), not just filter states.
- **Trust without reviews.** The Infatuation's whole model is
  [editorial independence *as* the trust signal](https://www.theinfatuation.com/about) — no crowd
  reviews, exactly our constraint. [DoorDash's "Most Loved"](https://get.doordash.com/blog/most-loved)
  badge is computed from **objective operational attributes, not star ratings**. Google Maps research
  shows many users [distrust the star average and decide on structured facts](https://www.androidpolice.com/stopped-trusting-star-ratings-how-i-judge-place-on-google-maps/)
  (timing, busyness, attributes) — *which we already own* (day×meal grid, tiers, menu depth).
- **The dish is a valid unit of browsing.** Yelp
  [flipped its entire UX from listings-forward to food-forward](https://www.localogy.com/2022/08/yelp-redesigns-its-ux-for-food-discovery/)
  and built ["Popular Dishes"](https://blog.yelp.com/news/introducing-popular-dishes-on-yelp-taking-the-guesswork-out-of-what-to-order/)
  to kill "what do I order?" We have ~7,000 named dishes and title-cased menus — words can carry
  desire without photos.
- **Honest scarcity, not fake urgency.** [Fever's real seat-counts / sold-out states](https://www.sharetribe.com/create/how-to-build-website-like-fever/)
  and OpenTable's [disappearing booked slots](https://zmaic.com/ux-case-study-4-open-table) — the
  honest opposite of Booking.com's manufactured "booked 30 times." Our Aug–Sep window and each spot's
  narrow serving days are *true* deadlines.
- **The decision is social; the share is the mechanic.** [Partiful wins on a single shareable link](https://medium.com/design-bootcamp/partiful-where-did-it-come-from-and-is-it-here-to-stay-401cbbcfe016)
  with no login; [Airbnb added collaborative wishlists](https://news.airbnb.com/airbnb-2024-summer-release-highlights/)
  because [80%+ of trips are group decisions](https://news.airbnb.com/airbnb-2024-summer-release-highlights/)
  — but only ~1% used them until they were made frictionless and front-and-center.
- **Pairwise beats all-at-once.** Beli replaces stars with
  [forced this-or-that ranking](https://www.today.com/food/trends/what-is-beli-app-rcna217748); recent
  research finds [pairwise presentation measurably improves decisions](https://arxiv.org/pdf/2601.15332).
  Fully buildable in-memory.

---

## 4. The ranked gaps

Ranked by **impact × fit-to-domain × constraint-feasibility**. Each: the principle, the evidence,
our current state, a fix that respects *no-reviews / no-per-dish-photos / rows / Deco austerity*, and
rough effort.

### Gap 1 — No visceral appetite *(biggest)*
**Principle:** Norman's *visceral* level; the appetite blind spot of the Aesthetic-Usability Effect
(Kurosu & Kashimura, *CHI '95*; Tractinsky et al. 2000). Elegant + austere reads as *tasteful*, which
is not *tasty* — the halo we earn (competence) isn't the halo the domain needs (desire).
**Now:** text-only; the single restaurant-level image is **unused**; the most viscerally saturated
object on screen is the *price chip*.
**Fix (constraint-safe):** carry appetite in the two channels we're allowed — **language and one
image.** A real **signature-dish callout** per restaurant (evocative, not the raw CMS name); use the
unused hero image sparingly on the *expanded/detail* state (respects rows-not-cards); let a touch of
warmth land on the *food* object, not only price. **Effort: M** (signature dish needs a `derived/` pass).

### Gap 2 — Zero on-surface social proof
**Principle:** Social proof (Cialdini, *Influence*; Salganik et al., *Science* 2006 — social influence
dominates quality signals for experiential goods) + Jakob's Law (users expect Yelp/OpenTable anchors;
absence reads as "info missing," not "principled").
**Now:** legally forced silence — reviews are deep-linked, never fetched (CLAUDE.md). We say *nothing*.
**Fix:** proof needn't be *their* review text. (i) First-party proof — Michelin / James Beard / tier +
**scarcity-as-proof** ("1 of only 8 Peruvian spots this year"). (ii) Make the deep-link *to* Yelp/Google
ratings a **prominent, expected** affordance, not buried as "Details." (iii) Short editorial one-line
takes in `derived/`. Point at the crowd confidently instead of pretending it isn't there. **Effort: S–M.**

### Gap 3 — No shortlist / save / compare
**Principle:** Zeigarnik effect (open loops consume working memory) + Miller (WM ≈ 4 chunks) + the
group-decision substrate.
**Now:** none — every candidate you're weighing is an open loop held in your head; comparison is "keep
three in mind and argue."
**Fix:** a **client-side shortlist** via `localStorage` — the *exact* mechanism already shipped for the
AM/PM `mood` toggle. A pin on each row, a small "Your shortlist (3)" tray, and a URL-encoded share.
No backend, no login. **Effort: S–M.** *(Highest impact-to-cost ratio in the whole review.)*

### Gap 4 — No confident default / recommendation
**Principle:** Decision fatigue & the power of defaults (Johnson & Goldstein, *Science* 2003) +
satisficer vs maximizer (Schwartz et al. 2002) + peak-end.
**Now:** the app is *all tools, no opinion.* The flagship list's default sort degrades to **A–Z**
(`runQuery`: `relevance && !ids ? 'name'`) — literally no recommendation, handed to a tired, deferral-
prone group.
**Fix:** a **"Tonight's pick" / "Just pick for us"** path that stages *one* (or a satisficer-sized few)
defensible choice from data we already have — mood fit + `choiceScore` + tier + tonight's availability.
Maximizers keep every tool; satisficers get a door marked *exit*. **Effort: M.**

### Gap 5 — The group-decision deadlock is unaddressed
**Principle:** Fogg Behavior Model (B=MAP: friction is near-zero, but the *prompt to commit* is absent)
+ diffusion of responsibility (Darley & Latané 1968).
**Now:** the tool is strictly single-player for a multi-player problem. It produces a list to *argue
over*, not a mechanism to *converge*.
**Fix:** build convergence on the shortlist (Gap 3) — a shareable set, a "narrow to 3, then decide"
flow, and/or a neutral **"decide for us"** that *launders the responsibility* (why "let's flip a coin"
resolves deadlocks). Optionally a **pairwise "this or that"** to break the final tie. **Effort: M.**

### Gap 6 — Price is the only isolated/anchored element → the event reads as *cost*, not *value*
**Principle:** Von Restorff (the one isolated object becomes the memory anchor) + anchoring (Tversky &
Kahneman 1974) + decoy/compromise effect (Huber, Payne & Puto 1982 — the middle tier is chosen more
when all three are shown).
**Now:** the flamingo chip trains users to remember restaurants *by price first*; "$65" shows with no
counter-anchor, so it reads as **expense**. Restaurant Week is a discount event displayed without the
discount.
**Fix:** frame the tier as **value** — "**3 courses, $65**" (course-count as counter-anchor); keep all
three tiers visible together as a value frame. Optionally spend a *second, rare* isolation slot on a
genuine quality mark (Michelin) — still Von-Restorff-safe if kept scarce. **Effort: S.**

### Gap 7 — No engineered peak; the ending is a hand-off
**Principle:** Peak-End rule (Kahneman et al. 1993) — a smooth-but-*flat* experience is remembered as
forgettable.
**Now:** uniformly calm; the last Miami-Spice moment is an outbound "Book on OpenTable" link — a
*departure*, not a payoff.
**Fix:** dramatize the peak (the "**7 perfect matches**" resolution; the mood-lens "found you a gem"
moment) and own the end with a confident confirmation state — *"Great pick. Kaido · Wynwood · Dinner
$65. The one dish to order: ___"* — before the outbound click. **Effort: S–M.**

### Gap 8 — Honest scarcity stated as metadata, not felt as motivation
**Principle:** Scarcity (Cialdini; Worchel et al. 1975 — same cookies rated better when scarce).
**Now:** "August – September" and "menus shift mid-season" are *neutral facts*; narrow per-restaurant
availability shows factually but is never framed as a reason to act.
**Fix:** non-manipulative urgency — a "**Restaurant Week ends in N days**" register and framing genuinely
limited availability ("Dinner only, Fri–Sat") as a reason to plan now. **Effort: S.**

---

## 5. Prioritized plan — make it *warm, trustworthy, decisive*

Grouped by the three deficits, ordered by ratio of impact to effort.

**Quick wins (S — do first):**
- **Value-frame the price** — "3 courses, $65" + all tiers visible (Gap 6).
- **Scarcity register** — "Restaurant Week ends in N days"; availability as a plan-now reason (Gap 8).
- **Promote the trust deep-links** — surface "See ratings on Google/Yelp" as a first-class action, not
  buried in "Details" (Gap 2, part ii).

**Bigger bets (M — the real levers):**
- **Client-side shortlist + shareable URL** (Gaps 3 & 5) — one build unlocks memory-offload, the group
  flow, and the pairwise tie-breaker. *Start here among the bets.*
- **"Tonight's pick / Just pick for us"** confident default + finite named lists ("The Spice 20") (Gaps 4 & 7).
- **Appetite via language + one image** — `derived/` signature-dish callouts; hero image on the detail
  state; dish-as-hero typography (Gap 1). This is the one that needs an enrichment pass.

**Cross-cutting:** all of the above respect the keyless / no-login / no-reviews / anti-slop constraints
and reuse machinery already in the app (`localStorage` precedent, `choiceScore`, `MOODS`, `derived/`).

---

## 6. The discipline tension — and how to resolve it

The obvious fixes (photos, warmth, social-style cards, "best of" badges) pull straight toward the
generic photo-grid / review-blob app that `DESIGN_REVIEW.md` was written to reject. The resolution is
not to abandon the discipline — it's to add **appetite, trust, and decisiveness *in the app's own
language*:**

- Appetite through **words and one earned image**, not a photo grid (Yelp-style dish-forward, but typographic).
- Trust through **objective facts, editorial voice, and confident outbound links** (Infatuation/Google-Maps
  model), not hosted star blobs.
- Decisiveness through **a single hero pick and a finite named list** (Time Out/Eater), not an infinite feed.
- Warmth through **microcopy and a peak/confirmation moment**, not neon and glow.

Every one of these is *more* on-brand for a "made-with-care, honest, unofficial" directory than the
conventions it's declining. The austerity was never the problem; the *silence on desire, trust, and
commitment* is.

---

## 7. Sources

**Psychology:** Iyengar & Lepper 2000 (*JPSP*, jam study) · Scheibehenne et al. 2010 (*JCR*, moderators) ·
Schwartz 2002/2004 (satisficer/maximizer) · Hick 1952 / Hyman 1953 · Miller 1956 / Cowan 2001 · Sweller
1988 (cognitive load) · [Kurosu & Kashimura 1995](https://www.nngroup.com/articles/aesthetic-usability-effect/) ·
Tractinsky et al. 2000 · Norman 2004 (*Emotional Design*) · Kahneman et al. 1993 (peak-end) · von Restorff
1933 · Zeigarnik 1927 · Johnson & Goldstein 2003 (*Science*, defaults) · Tversky & Kahneman 1974 (anchoring) ·
Huber/Payne/Puto 1982 (decoy) · Cialdini *Influence* (social proof, scarcity) · Salganik et al. 2006
(*Science*) · Worchel et al. 1975 · Fogg 2019 (B=MAP) · Darley & Latané 1968 (diffusion of responsibility) ·
[Laws of UX](https://lawsofux.com/) (Yablonski) · NN/g heuristics & Gestalt series · Baymard filter-UI.

**Market:** [The Infatuation](https://www.theinfatuation.com/about) · [Eater 38](https://www.barvlaha.com/press/eater-boston-the-38-essential-restaurants-in-boston) ·
[Resy Hit List](https://blog.resy.com/category/the-hit-list/) · [OpenTable Diners' Choice](https://www.opentable.com/restaurant-solutions/resources/opentable-diners-choice/) ·
[Google Maps trust](https://www.androidpolice.com/stopped-trusting-star-ratings-how-i-judge-place-on-google-maps/) ·
[Yelp food-forward redesign](https://www.localogy.com/2022/08/yelp-redesigns-its-ux-for-food-discovery/) ·
[DoorDash Most Loved](https://get.doordash.com/blog/most-loved) · [Beli](https://www.today.com/food/trends/what-is-beli-app-rcna217748) ·
[Fever](https://www.sharetribe.com/create/how-to-build-website-like-fever/) · [Tock](https://bitebuddy.ai/blog/restaurant-reservation-software) ·
[Time Out #1](https://www.timeout.com/miami/news/miami-has-a-new-number-one-restaurant-according-to-time-out-031725) ·
[Partiful](https://medium.com/design-bootcamp/partiful-where-did-it-come-from-and-is-it-here-to-stay-401cbbcfe016) ·
[Airbnb collaborative wishlists](https://news.airbnb.com/airbnb-2024-summer-release-highlights/) ·
[pairwise-choice research](https://arxiv.org/pdf/2601.15332).

Cross-referenced with the repo's own [DESIGN_REVIEW.md](DESIGN_REVIEW.md), [VICE_DIRECTION.md](VICE_DIRECTION.md),
[REVAMP_IA.md](REVAMP_IA.md), and [ROADMAP.md](ROADMAP.md).
