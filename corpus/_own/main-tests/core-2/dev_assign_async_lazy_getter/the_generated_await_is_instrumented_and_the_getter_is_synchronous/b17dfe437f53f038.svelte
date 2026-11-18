<script>
	let cache = $state({});

	async function go() {
		const value = cache.value ??= await get_value();
	}

	function get_value() {
		return 42;
	}
</script>

<button onclick={go}>go</button>
