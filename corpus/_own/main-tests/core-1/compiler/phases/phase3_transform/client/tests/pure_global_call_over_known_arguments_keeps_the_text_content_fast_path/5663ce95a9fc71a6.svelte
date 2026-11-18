<script>
	let n = $state(1);
	const user = (x) => x;
	const d = $derived(Math.abs(n) + 1);
</script>
<b>{d}</b>
