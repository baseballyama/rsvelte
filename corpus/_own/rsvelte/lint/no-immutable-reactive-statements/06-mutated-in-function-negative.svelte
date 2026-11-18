<script>
	let a = 1;
	function inc() {
		a += 1;
	}
	$: d = a * 2;
</script>

<button on:click={inc}>{d}</button>
