<script>
	import C from './C.svelte';
	let n = $state(0);
	let h = $state(() => {});
	function f() { n++; }
	const make = () => () => {};
</script>
<C on:click={f} on:click|once={() => n++} on:hover={h} on:make={make()} on:bubble on:x-y={f} a={n} />
<svelte:component this={C} on:click={f} />
