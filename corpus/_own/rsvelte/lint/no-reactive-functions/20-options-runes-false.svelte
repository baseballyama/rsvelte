<svelte:options runes={false} />

<script>
	export let count;
	const holder = { $props: 1 };
	let fn;
	$: fn = () => count * 2;
	void holder;
</script>

{fn()}
