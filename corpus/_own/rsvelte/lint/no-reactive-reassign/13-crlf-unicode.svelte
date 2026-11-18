<script>
	export let count;
	$: 二倍 = count * 2;
	function reset() {
		/* 🎉 */ 二倍 = 0;
	}
</script>

<button on:click={reset}>{二倍}</button>
