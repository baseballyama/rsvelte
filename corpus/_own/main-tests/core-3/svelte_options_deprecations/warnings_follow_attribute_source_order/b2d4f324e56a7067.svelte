<svelte:options immutable accessors />
<script>
	let n = $state(1);
</script>

<b>{n}</b>