<script>
let n = $state(0);
async function f() {
	// svelte-ignore await_reactivity_loss
	// svelte-ignore state_referenced_locally
	const a = await load();
}
</script>
<p>{n}</p>
