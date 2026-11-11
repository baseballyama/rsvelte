<script>
	let a = $state(1);
	let d = $derived(a * 2);
	{
		$inspect(a);
	}
</script>
<b>{a}{d}</b>
