<script>
  import { MEAL_LABEL } from '../lib/search.js'

  /**
   * The signature element. Three fixed rows per menu with the choose-count as a
   * visible fraction, because how much choice you actually get is the thing that
   * varies between restaurants and the official site buries it.
   *
   * This is where the visual boldness is spent; everything around it stays quiet.
   */
  let { menus = [] } = $props()
</script>

{#each menus as menu, i}
  <section class="menu" class:first={i === 0}>
    <header>
      <span class="meal micro">{MEAL_LABEL[menu.meal] ?? menu.meal}</span>
      <span class="stripes" aria-hidden="true"></span>
      {#if menu.price}<span class="price mono">${menu.price}</span>{/if}
    </header>

    {#each menu.courses.filter((c) => c.of > 0) as c}
      <div class="course">
        <span class="name micro">{c.name}</span>
        <span class="frac mono" title="Choose {c.choose} of {c.of}">
          {c.choose}<span class="of">of</span>{c.of}
        </span>
        <span class="items">
          {#each c.items as item, j}{item}{#if j < c.items.length - 1}<span class="sep" aria-hidden="true">·</span>{/if}{/each}
        </span>
      </div>
    {/each}
  </section>
{:else}
  <p class="none">No menu published yet — check the restaurant's page.</p>
{/each}

<style>
  .menu { margin-top: var(--s5); }
  .menu.first { margin-top: 0; }

  header { display: flex; align-items: center; gap: var(--s3); margin-bottom: var(--s3); }

  .meal { color: var(--marine); letter-spacing: 0.18em; }

  /* Racing stripes — the Deco device that translates most directly to 2D. */
  .stripes {
    flex: 1;
    height: 5px;
    background: repeating-linear-gradient(to bottom, var(--rule) 0 1px, transparent 1px 2px);
  }

  .price { font-size: var(--t-body); color: var(--flamingo); }

  .course {
    display: grid;
    grid-template-columns: 88px 62px 1fr;
    gap: var(--s4);
    align-items: baseline;
    padding: 5px 0;
  }

  .course .name { line-height: 1.6; }

  .frac { font-size: var(--t-body); color: var(--ink); white-space: nowrap; }
  .frac .of { color: var(--soft); font-size: var(--t-meta); margin: 0 var(--s1); }

  .items { font-size: var(--t-body); color: var(--soft); line-height: 1.6; }
  .sep { color: var(--hair); margin: 0 var(--s2); }

  .none { font-size: var(--t-body); color: var(--soft); margin: 0; }

  @media (max-width: 560px) {
    .course { grid-template-columns: 1fr; gap: 2px; padding: var(--s2) 0; }
  }
</style>
