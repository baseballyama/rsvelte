<!--
 @component PanelValueIcon
 Based on https://icon-sets.iconify.design/lucide/sidebar-open/
-->
<script lang="ts">
  import rotate from '../../transition/rotate.js'
  import { useOptions } from '../../options.svelte.js'

  type Props = {
    add?: boolean
  }

  let { add = true }: Props = $props()
  const options = useOptions()
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <g
    fill="none"
    stroke="currentColor"
    stroke-linecap="square"
    stroke-linejoin="round"
    stroke-width="2"
  >
    <rect width="20" height="20" x="2" y="2" rx="2" />
    <path d="M9 3v18" />
    {#if add}
      <path
        d="M 15.5 9 l 0 6"
        style="transform-box: fill-box"
        transform-origin="center"
        in:rotate={{
          rotation: -90,
          duration: options.transitionDuration,
          opacity: 1,
        }}
        out:rotate={{
          rotation: 90,
          opacity: 1,
          duration: options.transitionDuration,
        }}
      />
    {/if}
    <path d="M 12.5 12 l 6 0" />
  </g>
</svg>
