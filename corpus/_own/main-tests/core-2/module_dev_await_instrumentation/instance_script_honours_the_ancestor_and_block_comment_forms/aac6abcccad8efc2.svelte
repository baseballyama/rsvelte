<script>
	let count = $state(0);
// svelte-ignore await_reactivity_loss
	async function f() {
		return await g();
	}
</script>

<p>{count}</p>