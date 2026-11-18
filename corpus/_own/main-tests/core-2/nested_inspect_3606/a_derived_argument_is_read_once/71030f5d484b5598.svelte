<script>
	let a = $state(1);
	let d = $derived(a * 2);
	try {
		$inspect(d);
	} catch {}
</script>
<b>{a}{d}</b>
