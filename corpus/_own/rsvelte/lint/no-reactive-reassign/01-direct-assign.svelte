<script>
	export let count;
	$: doubled = count * 2;
	function reset() {
		doubled = 0;
	}
</script>

<button on:click={reset}>{doubled}</button>
