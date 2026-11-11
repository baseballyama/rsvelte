<script>
	export let a = 1;
	export let b = () => $$props.x;
</script>
<div {...$$restProps}>{a}</div>