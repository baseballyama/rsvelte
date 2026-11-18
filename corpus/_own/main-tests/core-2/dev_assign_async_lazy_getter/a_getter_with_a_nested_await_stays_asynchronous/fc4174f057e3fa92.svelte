<script>
	let cache = $state({});

	async function go() {
		const value = cache.value ??= await outer(await inner());
	}
</script>

<button onclick={go}>go</button>
