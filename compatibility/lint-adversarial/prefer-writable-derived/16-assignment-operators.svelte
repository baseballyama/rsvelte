<script>
	let src = $state(0);
	let a = $state(0);
	let b = $state(0);
	let c = $state(0);
	$effect(() => {
		a ??= src;
	});
	$effect(() => {
		b ||= src;
	});
	$effect(() => {
		c **= src;
	});
</script>

{a}{b}{c}
