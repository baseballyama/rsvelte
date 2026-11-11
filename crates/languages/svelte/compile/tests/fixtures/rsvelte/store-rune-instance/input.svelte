<script>
	const state = { a: 1 };
	let count = $state(0);
</script>

<button onclick={() => count++}>{count} {state.a}</button>
