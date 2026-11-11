<script>
	const { dims } = $props();

	function noop() {
		let x = 1;
		// svelte-ignore state_referenced_locally
	}
	const after = dims.length > 0;
</script>

{after}
