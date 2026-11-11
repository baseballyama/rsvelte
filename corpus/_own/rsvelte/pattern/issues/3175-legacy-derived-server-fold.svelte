<svelte:options runes={false} />

<script>
	import { writable } from 'svelte/store';

	const derived = writable((f) => f);
	const state = writable((f) => f);
	const WIDTH = 4;

	let plain = $derived(1);
	let arith = $derived(2 + 3);
	let viaConst = $derived(WIDTH);
	let notFolded = $state(5);
</script>

<p>{plain}{arith}{viaConst}{notFolded}</p>
