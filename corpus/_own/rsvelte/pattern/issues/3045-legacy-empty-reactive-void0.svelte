<svelte:options immutable />

<script>
	export let data = {};
	let internal = 1;
	$: ;
	$: keys = Object.keys(data);

	function bump() {
		internal += 1;
	}
</script>

<button on:click={bump}>{keys.length}:{internal}</button>
