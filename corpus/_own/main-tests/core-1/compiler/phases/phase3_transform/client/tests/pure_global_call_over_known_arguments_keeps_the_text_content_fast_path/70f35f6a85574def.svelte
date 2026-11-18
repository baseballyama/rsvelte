<script>
	let n = $state(1);
	const user = (x) => x;
	const d = $derived(Math.hypot(n, 2));
</script>
<b>{d}</b>
