<script>
	let n = $state(1);
	const user = (x) => x;
	const d = $derived(Math.clz32(n));
</script>
<b>{d}</b>
