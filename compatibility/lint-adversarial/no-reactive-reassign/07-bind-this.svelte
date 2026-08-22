<script>
	export let count;
	$: el = count ? null : undefined;
</script>

<div bind:this={el}>{count}</div>
