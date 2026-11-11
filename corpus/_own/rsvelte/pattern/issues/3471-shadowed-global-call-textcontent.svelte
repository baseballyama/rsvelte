<script>
	const Math = { abs: (x) => x };
	let n = $state(1);
	const shadowed = $derived(Math.abs(n));
</script>

<b>{shadowed}</b>
