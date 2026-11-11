<script>
	async function load() {
		return await g(await h());
	}
</script>

<button on:click={load}>go</button>