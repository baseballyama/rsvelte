<script>
	const { dims } = $props();
	function id(a, b) { return b; }

	const opts = id(1, // svelte-ignore state_referenced_locally
		dims.length > 0);
</script>

{opts}
