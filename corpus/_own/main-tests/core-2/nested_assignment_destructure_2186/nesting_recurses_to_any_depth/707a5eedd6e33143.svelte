<script>
	let src = { a: { b: { c: 1 } } };
	let c = 0;
	$: ({ a: { b: { c } } } = src);
</script>
<button onclick={() => src++}>{c}</button>