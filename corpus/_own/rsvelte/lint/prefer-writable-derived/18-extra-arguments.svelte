<script>
	let src = $state(0);
	let a = $state(0);
	const teardown = () => {};
	$effect(() => {
		a = src;
	}, teardown);
	$effect();
	$effect.pre(() => {
		a = src;
	});
</script>

{a}
