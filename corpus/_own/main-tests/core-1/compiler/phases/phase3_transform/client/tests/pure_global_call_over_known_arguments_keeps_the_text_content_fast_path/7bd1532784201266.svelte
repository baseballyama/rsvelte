<script>
	let n = $state(1);
	const user = (x) => x;
	const d = $derived(Number.isInteger(n));
</script>
<b>{d}</b>
