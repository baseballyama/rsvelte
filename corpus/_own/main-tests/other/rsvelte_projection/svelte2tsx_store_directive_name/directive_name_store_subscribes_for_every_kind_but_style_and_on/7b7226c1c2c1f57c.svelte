<script>
	import { writable } from 'svelte/store';
	const store = writable('v');
</script>

{#each [1] as k (k)}<div animate:$store>{k}</div>{/each}