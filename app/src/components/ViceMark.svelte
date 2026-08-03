<script module>
  // Unique clipPath id per instance — clipPath ids are global, so several marks on
  // one page would otherwise collide.
  let seq = 0
</script>

<script>
  /**
   * The Miami sun — a flat, banded sunset over a horizon line. This is the
   * "push Vice harder" moment, kept on-discipline: solid `currentColor` fills only,
   * no gradient, no glow (the banned synthwave tells), coloured by the cyan tint at
   * the call site — never the price flamingo. Reused as the image-fallback tile,
   * the empty-state mark, and the masthead brand mark.
   */
  let { size = 40 } = $props()
  const uid = `vm${seq++}`
</script>

<svg width={size} height={size * 0.84} viewBox="0 0 48 40" fill="none" aria-hidden="true" class="vice-mark">
  <defs>
    <clipPath id={uid}><circle cx="24" cy="21" r="12" /></clipPath>
  </defs>
  <g clip-path="url(#{uid})" fill="currentColor">
    <rect x="0" y="9" width="48" height="5" />
    <rect x="0" y="16" width="48" height="4" />
    <rect x="0" y="22" width="48" height="3" />
    <rect x="0" y="27" width="48" height="2" />
  </g>
  <rect x="4" y="33" width="40" height="2.6" rx="1.3" fill="currentColor" />
</svg>

<style>
  .vice-mark { display: block; }
</style>
