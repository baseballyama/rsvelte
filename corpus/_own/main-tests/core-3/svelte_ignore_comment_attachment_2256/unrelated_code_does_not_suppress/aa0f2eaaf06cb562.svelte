<script>
	const { dims } = $props();

	const opts = $state([
		{
			// svelte-ignore await_reactivity_loss
			propertyLevel: dims.length > 0
		}
	]);
</script>

{opts.length}
