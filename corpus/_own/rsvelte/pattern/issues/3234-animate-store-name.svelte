<script>
	import { writable } from 'svelte/store';
	import { flip } from 'svelte/animate';

	const store = writable(flip);
	let arr = $state([1, 2]);
</script>

{#each arr as k (k)}
	<div animate:$store>{k}</div>
{/each}
