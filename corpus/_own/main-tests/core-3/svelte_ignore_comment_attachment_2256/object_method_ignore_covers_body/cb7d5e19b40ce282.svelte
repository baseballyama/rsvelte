<script>
	const { dims } = $props();

	const obj = {
		// svelte-ignore state_referenced_locally
		compute() {
			return dims.length > 0;
		}
	};
	const v = obj.compute();
</script>

{v}
