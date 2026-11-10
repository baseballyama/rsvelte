<script>
	let { x = $bindable(), y, z: { w = $bindable(1) } } = $props();
</script>
{x}{y}{w}
