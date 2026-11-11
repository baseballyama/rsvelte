<script>
	let n = $state(1);
	const user = (x) => x;
	const d = $derived(JSON.stringify(n));
</script>
<b>{d}</b>
