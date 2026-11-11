<svelte:options runes={false} />
<script>
	import { writable } from 'svelte/store';

	const derived = writable((f) => f);
	let x = $derived(1);
</script>

<p>{x}</p>
