<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<aside class="callout callout-caution" aria-label="注意">
	<span class="callout-label"><Icon name="warn" size={13} />注意</span>
	<div class="text-fg">{@render children()}</div>
</aside>
