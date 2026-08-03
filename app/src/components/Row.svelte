<script>
  import CourseLadder from './CourseLadder.svelte'
  import ScheduleGrid from './ScheduleGrid.svelte'
  import { priceRange, offerLine, flagLabel, MEAL_ORDER } from '../lib/search.js'

  /**
   * A result ROW, not a card. NN/g lists four cases where cards are the wrong
   * component — search contexts, comparison tasks, homogeneous content, and
   * information density — and a 380-restaurant directory is all four. Rows keep
   * every name on one x-coordinate, which is what produces the layer-cake gaze
   * plot that makes a long list scannable.
   *
   * Three tiers and no more (the anchor / differentiators / price), per the
   * hierarchy every one of OpenTable, Yelp, Zillow and Google Flights uses.
   * Secondary actions live in the expanded panel; moving them off the row is
   * what buys the density.
   */
  let { r, course = 'all', saved = false, onTogglePin, initialOpen = false } = $props()
  let open = $state(initialOpen)
  let imgError = $state(false)

  const panelId = $derived(`menu-${r.id}`)
  const byMeal = (a, b) => MEAL_ORDER.indexOf(a.meal) - MEAL_ORDER.indexOf(b.meal)

  // Total dishes on offer — the "how much choice do I get" number the official
  // site buries. Built in the script (not the markup) to dodge Svelte's leading-
  // whitespace trim inside {#if}.
  const choiceCount = $derived((r.menus || []).reduce((n, m) => n + m.courses.reduce((s, c) => s + c.of, 0), 0))

  // Tier 2: every differentiator collapsed onto one dot-separated line.
  // No $$$ tier here: it collides with the numeric prix-fixe chip ("is $$$$ the
  // price?"). The chip carries price; the meta carries what/where/how-much-choice.
  const meta = $derived(
    [r.cuisines.join(', ') || 'Restaurant', r.hood, choiceCount ? `${choiceCount} dishes` : null]
      .filter(Boolean).join('  ·  '),
  )
  const offers = $derived([...r.offers].sort(byMeal))
  const menus = $derived([...r.menus].sort(byMeal))

  // The course "lens" from the strip re-points the teaser at that course.
  const COURSE_PAT = { starters: /appet|starter/i, mains: /entree|main/i, desserts: /dessert/i }

  /** One or two distinctive dishes — follows the selected course when one is set. */
  const teaser = $derived.by(() => {
    const pat = COURSE_PAT[course]
    for (const m of menus) {
      const c = pat
        ? m.courses.find((x) => pat.test(x.name) && x.of)
        : (m.courses.find((x) => /entree/i.test(x.name) && x.of) ?? m.courses.find((x) => x.of))
      if (c?.items?.length) return c.items.slice(0, 2).join('  ·  ')
    }
    return null
  })

  /** The one dish to name — appetite carried by language (UX review gap 1). */
  const signature = $derived.by(() => {
    for (const m of menus) {
      const c = m.courses.find((x) => /entree|main/i.test(x.name) && x.of) ?? m.courses.find((x) => x.of)
      if (c?.items?.length) return c.items[0]
    }
    return null
  })
</script>

<li class="row" class:open>
  <div class="row-head">
    <button
      class="pin"
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${r.name} from shortlist` : `Save ${r.name} to shortlist`}
      onclick={() => onTogglePin?.(r.id)}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d="M6 3.5h12v17l-6-4.2-6 4.2z" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
      </svg>
    </button>
    <button class="main" type="button" aria-expanded={open} aria-controls={panelId} onclick={() => (open = !open)}>
    <span class="text">
      <span class="name">{r.name}</span>
      <span class="meta">{meta}</span>
      {#if teaser}<span class="teaser">{teaser}</span>{/if}
    </span>
    <span class="side">
      {#if r.min_price != null}
        <span class="price mono">{priceRange(r)}</span>
      {:else}
        <span class="noprice mono">Menu only</span>
      {/if}
      <span class="when mono">{offers.map(offerLine).join('  ·  ')}</span>
    </span>
    <span class="chev" aria-hidden="true"></span>
    </button>
  </div>

  {#if open}
    <div class="panel" id={panelId}>
      {#if r.image && !imgError}
        <img class="hero" src={r.image} alt="" loading="lazy" onerror={() => (imgError = true)} />
      {/if}
      {#if signature}
        <p class="signature"><span class="siglbl micro">The dish to order</span>{signature}</p>
      {/if}

      {#if offers.length}
        <p class="sched-h micro">When it's served</p>
        <ScheduleGrid {offers} />
      {/if}

      <CourseLadder {menus} />

      {#if r.flags.length}
        <p class="flags micro">{r.flags.map(flagLabel).join('  ·  ')}</p>
      {/if}

      <div class="actions">
        {#if r.reserve}
          <a class="cta mono" href={r.reserve} target="_blank" rel="noopener">Book on {r.platform || 'their site'}</a>
        {/if}
        {#if r.maps}<a class="mono" href={r.maps} target="_blank" rel="noopener">Directions</a>{/if}
        {#if r.gsearch}<a class="mono" href={r.gsearch} target="_blank" rel="noopener">Ratings on Google</a>{/if}
        {#if r.yelp}<a class="mono" href={r.yelp} target="_blank" rel="noopener">Yelp</a>{/if}
        <a class="mono" href={r.url} target="_blank" rel="noopener">Details</a>
      </div>
    </div>
  {/if}
</li>

<style>
  .row { border-bottom: 1px solid var(--hair); }

  /* Pin lives in a fixed left gutter so names still share one x-coordinate. It's
     a separate control from the row disclosure (no nested buttons). */
  .row-head { display: grid; grid-template-columns: var(--tap) 1fr; align-items: stretch; border-radius: var(--r-md); }
  /* Highlight to the neutral elevated surface, not a tint — an Apple list-row hover
     that keeps the soft secondary text above the 7:1 dark-mode target. */
  .row-head:hover { background: var(--card); }
  .pin {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: var(--tap);
    color: var(--soft);
    margin-left: calc(var(--s2) * -1);
  }
  .pin:hover { color: var(--marine); }
  .pin[aria-pressed='true'] { color: var(--marine); }

  /* The whole row is the disclosure control, which makes the primary target far
     larger than Apple's 44pt floor instead of a 27px button. */
  .main {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto 20px;
    gap: var(--s6);
    align-items: center;
    width: 100%;
    text-align: left;
    padding: var(--s4) var(--s3);
    min-height: var(--tap);
  }
  .main:hover .name { color: var(--marine); }

  .text { display: block; min-width: 0; }

  .name {
    display: block;
    font-size: var(--t-name);
    font-weight: 600;
    letter-spacing: -0.015em;
    line-height: 1.25;
  }

  .meta {
    display: block;
    font-size: var(--t-meta);
    color: var(--soft);
    margin-top: 3px;
  }

  .teaser {
    display: block;
    font-size: var(--t-body);
    color: var(--soft);
    margin-top: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .side { text-align: right; white-space: nowrap; }

  /* The one saturated object per row: a flamingo price pill. Rounded and flat,
     turned up — heavier and a touch larger so the single accent carries the row. */
  .price {
    display: inline-block;
    font-size: var(--t-name);
    font-weight: 700;
    letter-spacing: -0.01em;
    padding: 4px var(--s4);
    border-radius: var(--r-sm);
    background: var(--flamingo);
    color: var(--card);
  }

  /* No prix-fixe price on record: a quiet note, never the flamingo pill. */
  .noprice { display: inline-block; font-size: var(--t-body); color: var(--soft); }

  .when { display: block; font-size: var(--t-meta); color: var(--soft); margin-top: 3px; }

  .chev {
    width: 9px; height: 9px;
    border-right: 2px solid var(--rule);
    border-bottom: 2px solid var(--rule);
    transform: rotate(45deg);
    justify-self: end;
  }
  .row.open .chev { transform: rotate(225deg); }

  /* The expanded detail — a soft, rounded, elevated card. */
  .panel {
    margin: 0 0 var(--s4);
    padding: var(--s5);
    background: var(--card);
    border: 1px solid var(--hair);
    border-radius: var(--r-lg);
    box-shadow: var(--eyebrow);
  }

  /* One earned image on the detail state (UX review gap 1) — bounded, rounded,
     never a grid. Degrades to nothing if the CDN is unreachable. */
  .hero {
    display: block;
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: var(--r-md);
    /* A neutral surface behind the image so a slow or failed load reads as an
       intentional panel, not a void; onerror still removes it entirely. */
    background: var(--sunk);
    margin-bottom: var(--s5);
  }

  /* Appetite carried by language: name the one dish worth coming for. */
  .signature { margin: 0 0 var(--s5); font-size: var(--t-name); line-height: 1.35; color: var(--ink); }
  .signature .siglbl { display: block; color: var(--marine); margin-bottom: var(--s1); }

  .sched-h { margin: 0 0 var(--s3); }

  .flags { margin: var(--s5) 0 0; }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s3);
    align-items: center;
    margin-top: var(--s5);
    padding-top: var(--s4);
    border-top: 1px solid var(--hair);
  }
  .actions a {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    padding: 0 var(--s4);
    border-radius: var(--r-full);
    font-family: var(--f-body);
    font-size: var(--t-body);
    font-weight: 500;
    text-decoration: none;
    color: var(--marine);
  }
  .actions a:hover { background: var(--marine-wash); }
  .actions .cta {
    color: var(--card);
    background: var(--marine);
    padding: 0 var(--s5);
    font-weight: 590;
    box-shadow: var(--eyebrow);
  }
  /* The CTA is filled tint; hover brightens it rather than shifting layout. */
  .actions .cta:hover { color: var(--card); background: var(--marine); filter: brightness(1.08); }

  @media (max-width: 720px) {
    .main { grid-template-columns: minmax(0, 1fr) 20px; gap: var(--s3); align-items: start; }
    .side { grid-column: 1; text-align: left; margin-top: var(--s2); }
    .when { white-space: normal; }
    .panel { padding: var(--s4); }
  }
</style>
