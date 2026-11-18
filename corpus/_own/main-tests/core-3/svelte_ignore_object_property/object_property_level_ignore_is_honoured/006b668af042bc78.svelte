<script>
	const { dims } = $props();

	// svelte-ignore state_referenced_locally
	const statementLevel = dims.length > 0;

	const opts = $state([
		{
			// svelte-ignore state_referenced_locally
			propertyLevel: dims.length > 0
		}
	]);
</script>

{statementLevel}{opts.length}