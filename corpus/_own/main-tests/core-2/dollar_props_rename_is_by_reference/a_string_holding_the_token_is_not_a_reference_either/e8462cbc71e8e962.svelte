<script>
	export let a = 1;
	const s = '$$props';
	const t = `x $$props y`;
</script>
<div {...$$restProps}>{a}</div>
