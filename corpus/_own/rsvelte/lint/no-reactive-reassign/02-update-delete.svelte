<script>
	export let count;
	$: box = { n: count };
	function poke() {
		box.n++;
		delete box.n;
	}
</script>

<button on:click={poke}>{box.n}</button>
