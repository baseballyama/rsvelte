<script lang="ts">
  import Inspect from '$lib/index.js'
  import { getContext } from 'svelte'
  import type { SvelteMap } from 'svelte/reactivity'
  getContext<SvelteMap<string, string>>('toc')?.set('Multi-line strings', 'multiline')
</script>

<div class="flex col">
  <h3 id="multiline">Multi-line strings</h3>
  <p>Expandable view for multi-line strings</p>

  <Inspect.Values normal="normal boring string" multiLine={'cool\n\tmulti-line\n\t\t\trender 😎'} />
</div>
