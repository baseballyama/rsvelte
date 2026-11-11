<script>
	let { to } = $props();
	let active = $derived(to === "x");
	let rest = { id: 'r' };
</script>
<a class:on={active} {...rest}>t</a>
<style>
	.active { color: red }
</style>
