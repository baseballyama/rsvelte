<script>
	import { writable } from 'svelte/store';

	export let seed = {};

	let contextStore = writable(seed);
	if (!contextStore) {
		contextStore = writable({});
	}

	let tabsId = 'tabs';
	let active = 0;

	$: $contextStore[tabsId] = { active };
</script>

<button on:click={() => active++}>{active}</button>
