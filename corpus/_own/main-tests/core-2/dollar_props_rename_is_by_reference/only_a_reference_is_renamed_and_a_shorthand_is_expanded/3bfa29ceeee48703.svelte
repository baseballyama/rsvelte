<script>
	export let a = 1;
	const o = {};
	({ $$props = 5 } = o);
</script>
<div {...$$restProps}>{a}</div>
