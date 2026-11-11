<script>
	let count = $state(0);
	async function f() {
		// svelte-ignore await_reactivity_loss
		const r = [
			await g()
		];
		return r;
	}
</script>

<p>{count}</p>