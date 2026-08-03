<script>
  import { MEAL_LABEL } from '../lib/search.js'
  import MenuSheet from './MenuSheet.svelte'

  /**
   * The signature element. Three fixed rows per menu with the choose-count as a
   * visible fraction, because how much choice you actually get is the thing that
   * varies between restaurants and the official site buries it. Each meal opens a
   * full-menu popup (MenuSheet) with every dish AND its description.
   */
  let { menus = [], restaurant = '' } = $props()

  // Dishes are {name, note}; the ladder shows names, the sheet shows descriptions.
  const names = (items) => items.map((i) => i.name)
  let sheetMenu = $state(null)
</script>

{#each menus as menu, i}
  <section class="menu" class:first={i === 0}>
    <header>
      <span class="meal micro">{MEAL_LABEL[menu.meal] ?? menu.meal}</span>
      <span class="stripes" aria-hidden="true"></span>
      {#if menu.price}<span class="price mono">{menu.courses.filter((c) => c.of > 0).length} courses · ${menu.price}</span>{/if}
    </header>

    {#each menu.courses.filter((c) => c.of > 0) as c}
      <div class="course">
        <span class="name micro">{c.name}</span>
        <span class="frac mono" title="Choose {c.choose} of {c.of}">
          {c.choose}<span class="of">of</span>{c.of}
        </span>
        <span class="items">
          {#each names(c.items) as item, j}{item}{#if j < c.items.length - 1}<span class="sep" aria-hidden="true">·</span>{/if}{/each}
        </span>
      </div>
    {/each}

    <button type="button" class="fullmenu" onclick={() => (sheetMenu = menu)}>
      See the full {MEAL_LABEL[menu.meal] ?? menu.meal} menu, with descriptions
      <span class="arw" aria-hidden="true">→</span>
    </button>
  </section>
{:else}
  <p class="none">No menu published yet — check the restaurant's page.</p>
{/each}

{#if sheetMenu}
  <MenuSheet menu={sheetMenu} {restaurant} onClose={() => (sheetMenu = null)} />
{/if}

<style>
  .menu { margin-top: var(--s5); }
  .menu.first { margin-top: 0; }

  header { display: flex; align-items: center; gap: var(--s3); margin-bottom: var(--s3); }

  .meal { color: var(--marine); }

  /* A 2px cyan rule carries the eye across to the price. */
  .stripes {
    flex: 1;
    height: 2px;
    background: var(--marine);
  }

  .price { font-family: var(--f-display); font-weight: 700; font-size: var(--t-body); color: var(--flamingo); }

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
  /* The separator must be legible between dish names, not a near-invisible hairline
     colour that made the list read as one run-on string (critique P2). */
  .sep { color: var(--rule); margin: 0 var(--s2); }

  .none { font-size: var(--t-body); color: var(--soft); margin: 0; }

  /* The affordance into the full-menu popup — where the dish descriptions live. */
  .fullmenu {
    display: inline-flex;
    align-items: center;
    gap: var(--s2);
    min-height: var(--tap);
    margin-top: var(--s3);
    padding: 0 var(--s4);
    border: 2px solid var(--rule);
    color: var(--marine);
    font-family: var(--f-display);
    text-transform: uppercase;
    letter-spacing: 0.03em;
    font-size: var(--t-meta);
    font-weight: 700;
  }
  .fullmenu:hover { background: var(--marine); color: var(--on-color); border-color: var(--marine); }

  @media (max-width: 560px) {
    .course { grid-template-columns: 1fr; gap: 2px; padding: var(--s2) 0; }
  }
</style>
