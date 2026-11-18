<script>
	let a = $state(1);
	let d = $derived(a * 2);
	for (let i = 0; i < 1; i++) {
		$inspect(a);
	}
</script>
<b>{a}{d}</b>
