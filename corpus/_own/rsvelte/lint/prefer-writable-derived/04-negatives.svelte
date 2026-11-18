<script>
	let src = $state(0);
	let a = $state(0);
	let box = $state({ n: 0 });
	$effect(() => {
		a = src;
		console.log(a);
	});
	$effect(() => {
		a += src;
	});
	$effect(() => {
		box.n = src;
	});
	$effect.root(() => {
		a = src;
	});
</script>

{a}{box.n}
