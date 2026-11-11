<script>
	export let a = 1;
	const s = '$$props';
	const t = s.length;
</script>
<div {...$$restProps}>{a}</div>