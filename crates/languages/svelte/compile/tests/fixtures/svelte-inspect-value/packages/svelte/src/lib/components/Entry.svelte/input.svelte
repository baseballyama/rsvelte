<script lang="ts">
  import { useOptions } from '../options.svelte.js'
  import { slide } from '../transition/index.js'

  let { i = 0, children } = $props()

  const options = useOptions()
</script>

<div
  role="listitem"
  class="entry"
  style="--i: {i}"
  transition:slide={{ duration: options.transitionDuration }}
>
  {@render children?.()}
</div>
