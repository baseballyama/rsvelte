<script module>
	const state = { a: 1 };
</script>
<script>
	let count = $state(0);
</script>

<button onclick={() => count++}>{count} {state.a}</button>
