<script>
	const { dims } = $props();

	class Box {
		// svelte-ignore state_referenced_locally
		field = dims.length > 0;

		// svelte-ignore state_referenced_locally
		method() {
			return dims.length;
		}
	}

	const box = new Box();
</script>

{box.field}
