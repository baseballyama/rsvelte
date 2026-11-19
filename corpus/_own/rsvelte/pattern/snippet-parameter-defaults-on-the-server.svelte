<script>
	import { writable } from 'svelte/store';
	const fallback = writable('fallback');
	let count = $state(0);
	let double = $derived(count * 2);
	let { name, ...rest } = $props();
</script>

{#snippet row(value = $fallback, d = double, n = name, r = rest.x, { a = $fallback } = {})}
	<p>{value}{d}{n}{r}{a}{$fallback}</p>
{/snippet}
{@render row()}
