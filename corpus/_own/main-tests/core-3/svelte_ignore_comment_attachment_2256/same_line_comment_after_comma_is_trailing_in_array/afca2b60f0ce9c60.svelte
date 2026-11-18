<script>
	const { dims } = $props();

	const opts = $state([1, // svelte-ignore state_referenced_locally
		dims.length > 0]);
</script>

{opts.length}
