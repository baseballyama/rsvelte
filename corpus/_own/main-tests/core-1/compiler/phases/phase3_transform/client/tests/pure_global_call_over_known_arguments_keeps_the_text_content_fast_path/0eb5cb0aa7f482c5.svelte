<script>
	const Math = { abs: (x) => x };
	let n = $state(1);
	const d = $derived(Math.abs(n));
</script>
<b>{d}</b>
