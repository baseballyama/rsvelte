<script>
	export let a = 1;
	const g = { get $$props() { return 1; } };
</script>
<div {...$$restProps}>{a}</div>
