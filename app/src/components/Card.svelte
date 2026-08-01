<script>
  import CourseLadder from './CourseLadder.svelte'
  import { priceRange, offerLine, flagLabel, MEAL_ORDER } from '../lib/search.js'

  let { r } = $props()
  let open = $state(false)

  const panelId = $derived(`menu-${r.id}`)
  const byMeal = (a, b) => MEAL_ORDER.indexOf(a.meal) - MEAL_ORDER.indexOf(b.meal)
  const meta = $derived([r.cuisines.join(' · ') || 'Restaurant', r.hood].filter(Boolean).join('  ·  '))
  const offers = $derived([...r.offers].sort(byMeal))
  const menus = $derived([...r.menus].sort(byMeal))
</script>

<article class="card" class:open>
  <div class="head">
    <div class="title">
      <h2>{r.name}</h2>
      <p class="meta micro">{meta}</p>
    </div>
    <p class="price mono">{priceRange(r)}</p>
  </div>

  <ul class="offers">
    {#each offers as o}
      <li class="mono">{offerLine(o)}</li>
    {/each}
  </ul>

  {#if r.flags.length}
    <p class="flags micro">{r.flags.map(flagLabel).join('  ·  ')}</p>
  {/if}

  <div class="actions">
    <button type="button" class="expand mono" aria-expanded={open} aria-controls={panelId} onclick={() => (open = !open)}>
      {open ? 'Hide menu' : 'See the menu'}
    </button>
    <span class="links mono">
      {#if r.reserve}<a href={r.reserve} target="_blank" rel="noopener">Book on {r.platform || 'their site'}</a>{/if}
      {#if r.maps}<a href={r.maps} target="_blank" rel="noopener">Directions</a>{/if}
      <a href={r.url} target="_blank" rel="noopener">Details</a>
    </span>
  </div>

  {#if open}
    <div class="panel" id={panelId}>
      <CourseLadder {menus} />
    </div>
  {/if}
</article>

<style>
  .card {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--r-md);
    padding: 1.15rem 1.35rem 1rem;
    transition: border-color 160ms, background 160ms;
  }
  .card:hover { border-color: var(--surface-2); background: var(--surface-2); }
  .card.open { border-color: var(--line); background: var(--surface); }

  .head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1.5rem; }

  h2 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 1.32rem;
    line-height: 1.15;
    letter-spacing: -0.028em;
    margin: 0;
    color: var(--text);
  }

  .meta { margin: 0.35rem 0 0; }

  .price {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    color: var(--hot);
    white-space: nowrap;
  }

  .offers { list-style: none; margin: 0.85rem 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.35rem; }
  .offers li {
    font-size: 0.68rem;
    background: var(--hot-dim);
    color: var(--pink);
    border-radius: var(--r-pill);
    padding: 0.18rem 0.6rem;
  }

  .flags { margin: 0.6rem 0 0; letter-spacing: 0.08em; }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-top: 1rem;
    padding-top: 0.85rem;
    border-top: 1px solid var(--line-soft);
  }

  .expand {
    border: 1px solid var(--line);
    border-radius: var(--r-pill);
    padding: 0.28rem 0.85rem;
    font-size: 0.68rem;
    color: var(--text-soft);
    transition: border-color 140ms, color 140ms;
  }
  .expand:hover { border-color: var(--cyan); color: var(--cyan); }

  .links { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.68rem; }
  .links a { color: var(--text-faint); text-decoration: none; transition: color 140ms; }
  .links a:hover { color: var(--cyan); }

  @media (max-width: 560px) {
    .card { padding: 1rem 1.1rem; }
    .head { flex-direction: column; gap: 0.5rem; }
    .actions { justify-content: flex-start; }
  }
</style>
