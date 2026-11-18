<script>
	let mut = 'x';
	function wrap() {
		const scoped = 'y';
		return scoped;
	}
	mut = wrap();
</script>

<button onclick={mut}>1</button>
<button onclick={scoped}>2</button>
