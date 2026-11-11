<script>
	let a = $state(1);
	let d = $derived(a * 2);
	if (a) {
		$inspect(a);
	}
</script>
<b>{a}{d}</b>
