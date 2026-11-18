<script>
	const { dims } = $props();

	// svelte-ignore state_referenced_locally
	const statementLevel = dims.length > 0;
</script>

{statementLevel}