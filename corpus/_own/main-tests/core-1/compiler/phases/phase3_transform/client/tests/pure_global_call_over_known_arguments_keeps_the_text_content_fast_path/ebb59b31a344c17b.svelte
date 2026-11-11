<script>
	let n = $state(1);
	const user = (x) => x;
	const d = $derived(n.toFixed(1));
</script>
<b>{d}</b>
