<script>
	export let a = 1;
	const o = {};
	const n = o?.$$props;
</script>
<div {...$$restProps}>{a}</div>
