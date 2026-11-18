<script>
	export let a = 1;
	const s = { ...$$props };
</script>
<div {...$$restProps}>{a}</div>
