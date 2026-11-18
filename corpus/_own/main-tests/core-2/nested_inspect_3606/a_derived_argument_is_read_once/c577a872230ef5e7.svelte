<script>
	let a = $state(1);
	let d = $derived(a * 2);
	{
		$inspect(d);
	}
</script>
<b>{a}{d}</b>
