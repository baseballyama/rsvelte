<script>
	let a, b, c, d;
	const rest = { x: 1 };
	$: a = [,];
	$: b = [...[]];
	$: c = { ...rest };
	$: d = [];
</script>

{a.length}{b.length}{typeof c}{d.length}
