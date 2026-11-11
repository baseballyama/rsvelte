<script>
	export let a = 1;
	const n = { deep: { $$props } };
</script>
<div {...$$restProps}>{a}</div>
