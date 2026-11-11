<script>
	let a = 1, b = 2;
	$: x = (a + b);
	const f = () => (a);
	const g = (a) + (b);
</script>
{x}{f}{g}
