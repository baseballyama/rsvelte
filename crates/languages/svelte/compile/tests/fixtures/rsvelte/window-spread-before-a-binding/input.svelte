<script>
	let v = $state(1);
	let rest = $state({});
</script>

<svelte:window bind:innerWidth={v} {...rest} />
