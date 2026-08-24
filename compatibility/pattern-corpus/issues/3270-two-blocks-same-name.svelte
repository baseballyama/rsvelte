<script>
	let base = $state(1);
	let a = 0;
	let b = 0;
	{
		let d = $derived(base + 1);
		a = d;
	}
	{
		let d = $derived(base + 2);
		b = d;
	}
</script>

<p>{a} {b}</p>
