<script>
	export let a = 1;
	export let count = 0;
	export let b = count + $$props.z;
</script>
<div {...$$restProps}>{a}</div>