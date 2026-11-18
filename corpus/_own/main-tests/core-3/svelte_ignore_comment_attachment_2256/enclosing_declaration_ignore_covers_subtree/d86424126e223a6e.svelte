<script>
	const { dims } = $props();

	// svelte-ignore state_referenced_locally
	const opts = $state([
		{
			deep: dims.length > 0
		}
	]);
</script>

{opts.length}
