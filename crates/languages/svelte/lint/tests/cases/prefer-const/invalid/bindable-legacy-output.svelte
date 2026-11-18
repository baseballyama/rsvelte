<svelte:options runes={false} />
<script>
	const { x = $bindable(), y } = $props();
</script>
{x}{y}
