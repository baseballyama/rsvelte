<svelte:options immutable accessors />

<script>
	export let data = {};
	let internal = 0;

	$: keys = Object.keys(data);

	function bump() {
		internal += 1;
	}
</script>

<button on:click={bump}>{keys.length}:{internal}</button>
