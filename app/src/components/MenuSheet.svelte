<script>
  import { MEAL_LABEL } from '../lib/search.js'

  /**
   * The full-menu popup (critique P1 + owner ask). The row and CourseLadder answer
   * "which dishes" at a glance; this sheet answers "what exactly is on the brunch
   * menu" — every course, the choose-count, and each dish WITH its description note
   * (present on ~90% of dishes, carried through prepare_data.py). Progressive
   * disclosure: teaser → course ladder (names) → this sheet (names + descriptions).
   *
   * Built as a real modal: portalled to <body> so no ancestor transform can trap it,
   * focus moved in and restored on close, Esc + backdrop close, background scroll
   * locked, and a labelled dialog for screen readers.
   */
  let { menu, restaurant, onClose } = $props()

  const courses = $derived((menu?.courses || []).filter((c) => c.of > 0))
  const mealLabel = $derived(MEAL_LABEL[menu?.meal] ?? menu?.meal ?? '')

  let closeBtn = $state()
  let dialog = $state()
  let lastFocused

  // Move the overlay to <body> so it is viewport-fixed regardless of the row's
  // stacking context, and remove it cleanly on teardown.
  function portal(node) {
    document.body.appendChild(node)
    return { destroy() { node.remove() } }
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { e.stopPropagation(); onClose?.(); return }
    if (e.key !== 'Tab') return
    // Trap focus within the dialog.
    const focusables = dialog?.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])')
    if (!focusables?.length) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }

  $effect(() => {
    lastFocused = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeBtn?.focus({ preventScroll: true })
    return () => {
      document.body.style.overflow = prevOverflow
      lastFocused?.focus?.({ preventScroll: true })
    }
  })
</script>

<svelte:window onkeydown={onKeydown} />

<div class="scrim" use:portal onclick={onClose} role="presentation">
  <div
    class="sheet"
    bind:this={dialog}
    role="dialog"
    aria-modal="true"
    aria-label="{restaurant} — {mealLabel} menu"
    onclick={(e) => e.stopPropagation()}
  >
    <header class="sheet-head">
      <div class="titles">
        <p class="rest">{restaurant}</p>
        <h2 class="meal">{mealLabel}<span class="price mono">${menu.price}</span></h2>
      </div>
      <button class="close" type="button" bind:this={closeBtn} onclick={onClose} aria-label="Close menu">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </header>

    <div class="sheet-body">
      {#each courses as c}
        <section class="course">
          <div class="course-head">
            <h3 class="cname">{c.name}</h3>
            <span class="choose mono">Choose {c.choose} of {c.of}</span>
          </div>
          <ul class="dishes">
            {#each c.items as it}
              <li class="dish">
                <p class="dname">{it.name}</p>
                {#if it.note}<p class="dnote">{it.note}</p>{/if}
              </li>
            {/each}
          </ul>
        </section>
      {/each}
      <p class="foot micro">Three courses for ${menu.price}, before tax and gratuity. Menus shift mid-season — confirm before you go.</p>
    </div>
  </div>
</div>

<style>
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: var(--s4);
    background: rgba(4, 10, 12, 0.62);
  }
  @media (min-width: 640px) { .scrim { align-items: center; } }
  @media (prefers-reduced-motion: no-preference) {
    .scrim { animation: fade 0.2s ease both; }
    .sheet { animation: rise 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
  }

  .sheet {
    width: 100%;
    max-width: 560px;
    max-height: 86vh;
    display: flex;
    flex-direction: column;
    background: var(--card);
    border: 1px solid var(--hair);
    border-radius: var(--r-lg);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }

  /* The head is a Vice-forward moment: a marine tint wash under the meal title,
     the flamingo price sitting inside it — the two hues together, on purpose. */
  .sheet-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--s4);
    padding: var(--s5) var(--s5) var(--s4);
    background: var(--marine-wash);
    border-bottom: 1px solid var(--hair);
  }
  .titles { min-width: 0; }
  .rest { margin: 0 0 var(--s1); font-size: var(--t-meta); color: var(--soft); }
  .meal {
    margin: 0;
    font-family: var(--f-display);
    font-weight: 800;
    font-size: var(--t-title);
    letter-spacing: -0.02em;
    display: flex;
    align-items: baseline;
    gap: var(--s3);
  }
  .meal .price {
    font-size: var(--t-name);
    font-weight: 700;
    color: var(--card);
    background: var(--flamingo);
    border-radius: var(--r-sm);
    padding: 2px var(--s2);
  }

  .close {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--tap);
    height: var(--tap);
    margin: calc(var(--s2) * -1) calc(var(--s3) * -1) 0 0;
    border-radius: var(--r-full);
    color: var(--ink);
  }
  .close:hover { background: var(--sunk); }

  .sheet-body { padding: var(--s5); overflow-y: auto; }

  .course { margin-bottom: var(--s6); }
  .course:last-of-type { margin-bottom: var(--s4); }
  .course-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--s3);
    margin-bottom: var(--s3);
    padding-bottom: var(--s2);
    border-bottom: 1px solid var(--hair);
  }
  .cname { margin: 0; font-size: var(--t-name); font-weight: 700; color: var(--marine); letter-spacing: -0.01em; }
  .choose { font-size: var(--t-meta); color: var(--soft); white-space: nowrap; }

  .dishes { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s4); }
  .dish { display: block; }
  .dname { margin: 0; font-size: var(--t-body); font-weight: 590; color: var(--ink); }
  .dnote { margin: 2px 0 0; font-size: var(--t-body); color: var(--soft); line-height: 1.45; }

  .foot { margin: var(--s2) 0 0; color: var(--soft); }
</style>
