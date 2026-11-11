<script>
	const { dims } = $props();
	function id(a, b) { return a; }

	const opts = id(
		// svelte-ignore state_referenced_locally
		dims.length > 0,
		1
	);
</script>

{opts}
