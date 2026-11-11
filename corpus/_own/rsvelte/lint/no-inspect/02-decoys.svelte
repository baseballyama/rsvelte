<script>
	let value = $state('a');
	const s = 'call $inspect(value) here';
	const t = `text $inspectature`;
	const r = /\$inspect/;
	// $inspect(value) in a line comment
	/* $inspect(value) in a block comment */
	let $inspectorLike = 1;
	const x$inspect = 2;
	void [value, s, t, r, $inspectorLike, x$inspect];
</script>
<p>{value}</p>
