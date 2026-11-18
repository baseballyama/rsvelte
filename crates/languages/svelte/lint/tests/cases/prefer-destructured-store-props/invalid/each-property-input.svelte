<script>
	import { writable } from 'svelte/store';
	const s = writable({});
	const items = [];
	const a = 1;
</script>

{#each items as a}{$s.a}{/each}
