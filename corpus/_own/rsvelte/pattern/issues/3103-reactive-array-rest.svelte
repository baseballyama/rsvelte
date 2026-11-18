<script>
	export let source = { a: 1, b: [2, 3] };
	export let arr = [4, 5, 6];

	$: ({ a, b: [first, ...tail] } = source);
	$: [head, ...restOfArr] = arr;
	$: ({ x, ...restObj } = source);
	$: total = a + first + tail.length + head + restOfArr.length + (x ?? 0) + Object.keys(restObj).length;
</script>

<p>{total}</p>
