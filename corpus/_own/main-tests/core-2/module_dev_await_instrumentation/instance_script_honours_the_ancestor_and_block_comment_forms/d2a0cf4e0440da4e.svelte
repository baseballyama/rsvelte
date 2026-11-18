<script>
	let count = $state(0);
	async function f() {
		const r = /* svelte-ignore await_reactivity_loss */ await g();
		return r;
	}
</script>

<p>{count}</p>