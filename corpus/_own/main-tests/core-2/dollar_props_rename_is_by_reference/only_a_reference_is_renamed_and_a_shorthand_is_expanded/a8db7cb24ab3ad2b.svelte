<script>
	export let a = 1;
	function f({ $$props }) { return $$props; }
	f({});
</script>
<div {...$$restProps}>{a}</div>
