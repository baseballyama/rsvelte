<script>
	import { writable } from 'svelte/store';
	const cnt = writable(0);
</script>
{#snippet outer()}{$cnt}{/snippet}
{@render outer()}
