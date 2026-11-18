<script>
	let a = $state(0);
	let b = $state(0);
	$effect(() => {
		a;
	});
	$inspect(b);
</script>
<p>{a}{b}</p>