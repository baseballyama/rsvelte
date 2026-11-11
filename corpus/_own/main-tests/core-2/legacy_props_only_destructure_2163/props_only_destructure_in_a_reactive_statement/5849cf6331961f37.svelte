<script>
	export let a = 1;
	export let b = 2;
	export let src = { a: 3, b: 4 };
	$: ({ a, b } = src);
</script>
<p>{a} {b}</p>