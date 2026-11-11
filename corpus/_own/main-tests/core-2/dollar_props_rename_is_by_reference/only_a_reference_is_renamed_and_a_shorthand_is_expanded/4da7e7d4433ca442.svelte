<script>
	export let a = 1;
	class C { $$props = 1; }
</script>
<div {...$$restProps}>{a}</div>
