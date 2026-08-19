<script>
	let src = $state(0);
	let [a] = $state([0]);
	let { b } = $state({ b: 0 });
	$effect(() => {
		a = src;
	});
	$effect.pre(() => {
		b = src;
	});
</script>

{a}{b}
