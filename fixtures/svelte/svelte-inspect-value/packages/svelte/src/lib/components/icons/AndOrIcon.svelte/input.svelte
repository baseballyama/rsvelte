<script lang="ts">
  let { mode = 'and' }: { mode?: 'and' | 'or' } = $props()
</script>

<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
  <g
    fill="currentColor"
    stroke-width="2.5"
    stroke="currentColor"
    style:rotate={mode === 'or' ? '180deg' : '0deg'}
    style="transform-box: fill-box"
    transform-origin="center"
  >
    <path d="M 12 8 l -4 7" />
    <path d="M 12 8 l 4 7" />
  </g>
</svg>
