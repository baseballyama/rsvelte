<script>
	const { dims } = $props();

	const opts = $state([
		{
			// svelte-ignore await_reactivity_loss, state_referenced_locally
			propertyLevel: dims.length > 0
		}
	]);
</script>

{opts.length}
