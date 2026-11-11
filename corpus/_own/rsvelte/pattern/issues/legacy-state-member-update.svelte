<script>
	let counts = {};

	function increment(key) {
		counts[key]++;
	}

	function decrement() {
		--counts.total;
	}
</script>

<button onclick={() => increment('clicks')}>{counts.clicks}</button>
<button onclick={decrement}>{counts.total}</button>
