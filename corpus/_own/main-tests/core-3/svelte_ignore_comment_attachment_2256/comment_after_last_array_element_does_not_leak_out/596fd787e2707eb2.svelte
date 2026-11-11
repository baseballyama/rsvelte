<script>
	const { dims } = $props();

	const list = $state([
		1
		// svelte-ignore state_referenced_locally
	]);
	const after = dims.length > 0;
</script>

{list.length}{after}
