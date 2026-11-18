<script>
	let src = $state(0);
	let a = $state(0);
	let b = $state(0);
	$effect(() => {
		a = src + 1;
	});
	$effect.pre(() => {
		b = src - 1;
	});
</script>

{a}{b}
