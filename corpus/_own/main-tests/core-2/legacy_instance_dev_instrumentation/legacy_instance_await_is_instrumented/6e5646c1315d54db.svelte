<script>
	async function load() {
		const r = await fetch("/x");
		return r;
	}
</script>

<button on:click={load}>go</button>