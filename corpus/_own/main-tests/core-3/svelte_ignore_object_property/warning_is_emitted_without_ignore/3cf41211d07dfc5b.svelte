<script>
	const { dims } = $props();

	const opts = $state([
		{
			propertyLevel: dims.length > 0
		}
	]);
</script>

{opts.length}