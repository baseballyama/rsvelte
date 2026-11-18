<script>
	let n = $state(1);
	const user = (x) => x;
	const d = $derived(Math.abs(n) ? 'a' : 'b');
</script>
<b>{d}</b>
