<script>
	async function load() {
		return (await g()) === 1;
	}
</script>

<button on:click={load}>go</button>