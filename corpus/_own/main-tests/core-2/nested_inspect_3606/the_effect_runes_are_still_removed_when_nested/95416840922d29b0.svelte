<script>
	let a = $state(1);
	let d = $derived(a * 2);
	try {
		$effect.pre(() => a);
	} catch {}
</script>
<b>{a}{d}</b>
