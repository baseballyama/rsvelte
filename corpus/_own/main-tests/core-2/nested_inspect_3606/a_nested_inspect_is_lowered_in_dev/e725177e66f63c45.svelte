<script>
	let a = $state(1);
	let d = $derived(a * 2);
	try {
		$inspect(a);
	} catch {}
</script>
<b>{a}{d}</b>
