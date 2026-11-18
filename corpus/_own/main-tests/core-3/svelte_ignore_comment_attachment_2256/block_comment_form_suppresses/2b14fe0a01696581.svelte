<script>
	const { dims } = $props();

	const opts = $state([
		{
			/* svelte-ignore state_referenced_locally */
			propertyLevel: dims.length > 0
		}
	]);
</script>

{opts.length}
