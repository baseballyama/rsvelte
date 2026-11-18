<script>
	const { dims } = $props();

	// svelte-ignore state_referenced_locally
	const first = 1;
	const second = dims.length > 0;
</script>

{first}{second}
