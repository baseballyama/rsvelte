<script>
	export let source = { a: 1, b: [2, 3] };
	let out = 0;

	$: ({ a, b: [first, ...tail] } = source);
	$: [x, y = 5] = b ?? [];
	$: out = a + first + tail.length + (x ?? 0) + y;
	$: label: {
		if (out > 100) break label;
		out += 0;
	}
	$: console.log(out);
</script>

<p>{out}{a}{first}{tail.length}{x ?? '-'}{y}</p>
