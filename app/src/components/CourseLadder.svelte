<script>
  import { MEAL_LABEL } from '../lib/search.js'

  /**
   * The signature element (BUILD_PLAN §5). Three fixed rows per menu with the
   * choose-count as a visible fraction, because how much choice you actually
   * get is the thing that varies between restaurants and the official site
   * buries it.
   */
  let { menus = [] } = $props()
</script>

{#each menus as menu}
  <section class="menu">
    <header>
      <span class="meal mono">{MEAL_LABEL[menu.meal] ?? menu.meal}</span>
      {#if menu.price}<span class="price mono">${menu.price}</span>{/if}
    </header>

    {#each menu.courses.filter((c) => c.of > 0) as c}
      <div class="row">
        <span class="course mono">{c.name}</span>
        <span class="frac mono" title="Choose {c.choose} of {c.of}">{c.choose}/{c.of}</span>
        <span class="items">
          {#each c.items as item, i}<span class="item">{item}</span>{#if i < c.items.length - 1}<span class="dot" aria-hidden="true">·</span>{/if}{/each}
        </span>
      </div>
    {/each}
  </section>
{:else}
  <p class="none">No menu published for this one yet — check the restaurant's page.</p>
{/each}

<style>
  .menu { border-top: var(--rule); padding-top: 0.6rem; margin-top: 0.6rem; }

  header {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin-bottom: 0.45rem;
  }

  .meal {
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--seaglass);
  }

  .price {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--program-red);
  }

  .row {
    display: grid;
    grid-template-columns: 6.5rem 2.2rem 1fr;
    gap: 0.5rem;
    align-items: baseline;
    padding: 0.22rem 0;
  }

  .course {
    font-size: 0.6rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }

  .frac {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--ink);
  }

  .items { font-size: 0.92rem; line-height: 1.45; color: var(--ink-soft); }
  .dot { color: var(--sand); margin: 0 0.35rem; }

  .none { font-size: 0.88rem; color: var(--ink-faint); font-style: italic; margin: 0.6rem 0 0; }

  @media (max-width: 560px) {
    .row { grid-template-columns: 1fr; gap: 0.1rem; }
    .frac { display: inline-block; }
  }
</style>
