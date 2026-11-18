<script>
	async function load() {
		// svelte-ignore await_reactivity_loss
		const r = await g();
		return r;
	}
</script>

<button on:click={load}>go</button>