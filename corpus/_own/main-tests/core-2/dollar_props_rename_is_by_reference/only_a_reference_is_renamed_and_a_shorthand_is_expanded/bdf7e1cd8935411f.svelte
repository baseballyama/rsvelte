<script>
	export let a = 1;
	const o = {};
	const m = o.$$props;
</script>
<div {...$$restProps}>{a}</div>
