<script>
	let n = $state(1);
	const user = (x) => x;
	const d = $derived(Math.trunc(n));
</script>
<b>{d}</b>
