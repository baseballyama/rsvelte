<svelte:options runes={false} />
<script>
	let { x = $bindable(), y } = $props();
</script>
{x}{y}
