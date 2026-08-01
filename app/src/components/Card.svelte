<script>
  import CourseLadder from './CourseLadder.svelte'
  import { priceRange, offerLine, flagLabel, MEAL_ORDER } from '../lib/search.js'

  let { r } = $props()
  let open = $state(false)

  const panelId = $derived(`menu-${r.id}`)
  const byMeal = (a, b) => MEAL_ORDER.indexOf(a.meal) - MEAL_ORDER.indexOf(b.meal)
  const meta = $derived([r.cuisines.join(' · ') || 'Restaurant', r.hood].filter(Boolean).join('  /  '))
  const offers = $derived([...r.offers].sort(byMeal))
  const menus = $derived([...r.menus].sort(byMeal))
</script>

<article class="card">
  <div class="head">
    <div class="title">
      <h2>{r.name}</h2>
      <p class="meta mono">{meta}</p>
    </div>
    <p class="price mono">{priceRange(r)}</p>
  </div>

  <ul class="offers">
    {#each offers as o}
      <li class="mono">{offerLine(o)}</li>
    {/each}
  </ul>

  {#if r.flags.length}
    <ul class="flags">
      {#each r.flags as f}
        <li class="mono">{flagLabel(f)}</li>
      {/each}
    </ul>
  {/if}

  <div class="actions">
    <button type="button" class="expand mono" aria-expanded={open} aria-controls={panelId} onclick={() => (open = !open)}>
      {open ? 'Hide menu' : 'See the menu'}
    </button>
    {#if r.reserve}
      <a class="mono" href={r.reserve} target="_blank" rel="noopener">Book on {r.platform || 'their site'}</a>
    {/if}
    {#if r.maps}<a class="mono" href={r.maps} target="_blank" rel="noopener">Directions</a>{/if}
    <a class="mono" href={r.url} target="_blank" rel="noopener">Details</a>
  </div>

  {#if open}
    <div class="panel" id={panelId}>
      <CourseLadder {menus} />
    </div>
  {/if}
</article>

<style>
  .card {
    background: var(--paper-raised);
    border: var(--rule);
    border-radius: var(--radius);
    padding: 0.9rem 1rem 0.8rem;
    box-shadow: var(--shadow);
  }

  .head { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; }

  h2 {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.28rem;
    line-height: 1.15;
    margin: 0;
    letter-spacing: -0.012em;
  }

  .meta {
    margin: 0.25rem 0 0;
    font-size: 0.66rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }
  .sep { color: var(--sand); }

  .price {
    margin: 0;
    font-size: 0.98rem;
    font-weight: 600;
    color: var(--program-red);
    white-space: nowrap;
  }

  .offers { list-style: none; margin: 0.6rem 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.3rem; }
  .offers li {
    font-size: 0.7rem;
    background: var(--seaglass-soft);
    color: var(--seaglass);
    border-radius: var(--radius);
    padding: 0.15rem 0.4rem;
  }

  .flags { list-style: none; margin: 0.4rem 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.3rem; }
  .flags li {
    font-size: 0.64rem;
    color: var(--ink-faint);
    border: 1px solid var(--sand-soft);
    border-radius: var(--radius);
    padding: 0.1rem 0.35rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.7rem;
    padding-top: 0.6rem;
    border-top: 1px dashed var(--sand-soft);
    font-size: 0.7rem;
  }

  .expand {
    border: var(--rule);
    background: var(--paper);
    border-radius: var(--radius);
    padding: 0.22rem 0.55rem;
    font-size: 0.7rem;
    color: var(--ink);
  }
  .expand:hover { border-color: var(--seaglass); color: var(--seaglass); }

  .actions a { color: var(--seaglass); text-decoration: none; border-bottom: 1px solid var(--sand); }
  .actions a:hover { border-color: var(--seaglass); }

  .panel { margin-top: 0.2rem; }
</style>
