<svelte:options runes={false} immutable={true} />

<script>
	export let value = 1;
	let internal = 0;

	$: internal = value * 2;
	$: {
		if (internal > 4) {
			internal = 4;
		}
	}
	$: ({ x } = { x: value });
</script>

<button on:click={() => (value += 1)}>{value} {internal} {x}</button>
