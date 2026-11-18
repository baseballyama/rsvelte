<script>
	let src = { a: { b: 1 } };
	let b = 0;
	$: ({ a: { b } } = src);
</script>
<button onclick={() => src++}>{b}</button>