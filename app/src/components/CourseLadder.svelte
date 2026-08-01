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
      <span class="meal micro">{MEAL_LABEL[menu.meal] ?? menu.meal}</span>
      <span class="hr" aria-hidden="true"></span>
      {#if menu.price}<span class="price mono">${menu.price}</span>{/if}
    </header>

    {#each menu.courses.filter((c) => c.of > 0) as c}
      <div class="row">
        <span class="course micro">{c.name}</span>
        <span class="frac mono" title="Choose {c.choose} of {c.of}">
          <span class="n">{c.choose}</span><span class="slash">/</span>{c.of}
        </span>
        <span class="items">
          {#each c.items as item, i}<span class="item">{item}</span>{#if i < c.items.length - 1}<span class="dot" aria-hidden="true">·</span>{/if}{/each}
        </span>
      </div>
    {/each}
  </section>
{:else}
  <p class="none">No menu published yet — check the restaurant's page.</p>
{/each}

<style>
  .menu { margin-top: 1.35rem; }

  header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }

  .meal { color: var(--cyan); letter-spacing: 0.16em; }

  .hr { flex: 1; height: 1px; background: var(--line); }

  .price { font-size: 0.78rem; font-weight: 500; color: var(--hot); }

  .row {
    display: grid;
    grid-template-columns: 6rem 2.6rem 1fr;
    gap: 0.85rem;
    align-items: baseline;
    padding: 0.32rem 0;
  }

  .course { line-height: 1.6; }

  .frac { font-size: 0.72rem; color: var(--text-faint); }
  .frac .n { color: var(--text); font-weight: 500; }
  .frac .slash { color: var(--text-faint); margin: 0 0.1rem; }

  .items { font-size: 0.9rem; line-height: 1.55; color: var(--text-soft); }
  .dot { color: var(--line); margin: 0 0.4rem; }

  .none { font-size: 0.85rem; color: var(--text-faint); margin: 1rem 0 0; }

  @media (max-width: 560px) {
    .row { grid-template-columns: 1fr; gap: 0.15rem; padding: 0.5rem 0; }
  }
</style>
