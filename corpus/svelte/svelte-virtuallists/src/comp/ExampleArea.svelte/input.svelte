<script lang="ts">
  import { type Component } from 'svelte';
  import type { SvelteExample } from './example';
  import Highlighted from './Highlighted.svelte';

  let { example }: { example: SvelteExample } = $props();

  //@ts-ignore
  const Comp = example.component as Component;
</script>

<div>
  <Comp></Comp>
  <Highlighted lang="svelte" highlighted={example.highlightedHTML} />
</div>
