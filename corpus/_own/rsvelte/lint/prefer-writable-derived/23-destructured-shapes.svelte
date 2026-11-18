<script>
	let src = $state(0);
	let [x] = $state([0]);
	let { y } = $state({ y: 0 });
	let [[z]] = $state([[0]]);
	let {
		p: { q }
	} = $state({ p: { q: 0 } });
	let [...rest] = $state([0]);
	$effect(() => {
		x = src;
	});
	$effect(() => {
		y = src;
	});
	$effect.pre(() => {
		z = src;
	});
	$effect(() => {
		q = src;
	});
	$effect(() => {
		rest = src;
	});
</script>

{x}{y}{z}{q}{rest}
