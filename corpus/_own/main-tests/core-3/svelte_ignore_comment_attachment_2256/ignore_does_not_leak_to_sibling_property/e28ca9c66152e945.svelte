<script>
	const { dims } = $props();

	const opts = $state([
		{
			// svelte-ignore state_referenced_locally
			a: 1,
			b: dims.length > 0
		}
	]);
</script>

{opts.length}
