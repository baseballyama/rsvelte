<script>
	import { writable } from 'svelte/store';
	const s = writable({});
	const items = [];
</script>

{#each items as i}{$s[i]}{/each}
