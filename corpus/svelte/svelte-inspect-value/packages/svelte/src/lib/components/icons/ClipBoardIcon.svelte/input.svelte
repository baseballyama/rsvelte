<!-- @component ClipBoardIcon
 https://icon-sets.iconify.design/lucide/clipboard-check/
 -->
<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements'
  import { draw } from 'svelte/transition'
  import { useOptions } from '../../options.svelte.js'

  type Props = {
    copied?: boolean
  } & SVGAttributes<SVGElement>

  let { copied = false }: Props = $props()

  const options = useOptions()
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <g
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
  >
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    {#if copied}
      <path d="m9 14l2 2l4-4" transition:draw={{ duration: options?.transitionDuration ?? 0 }} />
    {/if}
  </g>
</svg>
