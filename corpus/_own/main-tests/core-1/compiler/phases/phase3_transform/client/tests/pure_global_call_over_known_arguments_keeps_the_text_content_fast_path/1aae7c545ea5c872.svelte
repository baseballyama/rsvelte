<script>
	let n = $state(1);
	const user = (x) => x;
	const d = $derived(Math.atan2(n, 2));
</script>
<b>{d}</b>
