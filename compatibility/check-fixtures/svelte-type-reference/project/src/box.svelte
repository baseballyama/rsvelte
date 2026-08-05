<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, children }: { title?: string | Snippet; children: Snippet } = $props();
</script>

<section>
	{#if typeof title === 'string'}<h1>{title}</h1>{:else if title}{@render title()}{/if}
	{@render children()}
</section>
