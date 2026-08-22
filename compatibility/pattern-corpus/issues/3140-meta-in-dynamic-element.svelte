<script>
	let n = $state(1);
</script>

<svelte:element this={'div'}>
	<svelte:window onresize={() => n++} />
</svelte:element>
