<script>
	/* eslint svelte/no-reactive-reassign: ["warn", { "props": false }] */
	export let count;
	$: box = { n: count };
	function poke() {
		box.n = 1;
		box = { n: 0 };
	}
</script>

<button on:click={poke}>{box.n}</button>
