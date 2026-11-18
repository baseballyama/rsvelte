<script>
	const String = (x) => 'nope';
	let n = $state(1);
	const d = $derived(String(n));
</script>
<b>{d}</b>
