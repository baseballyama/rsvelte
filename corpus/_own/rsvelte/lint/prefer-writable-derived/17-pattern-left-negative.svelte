<script>
	let src = $state(0);
	let a = $state(0);
	let o = $state({ n: 0 });
	$effect(() => {
		[a] = [src];
	});
	$effect(() => {
		({ n: a } = o);
	});
	$effect(() => {
		o.n = src;
	});
</script>

{a}{o.n}
