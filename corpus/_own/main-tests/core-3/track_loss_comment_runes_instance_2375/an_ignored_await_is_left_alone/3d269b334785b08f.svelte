<script>
	async function f() {
		// svelte-ignore await_reactivity_loss
		return await /* hi */ load();
	}
	let x = $state(1);
</script>
<p>{x}</p>