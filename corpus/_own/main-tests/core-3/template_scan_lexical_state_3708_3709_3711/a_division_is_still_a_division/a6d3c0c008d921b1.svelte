<script>
	const obj = { a: 1 };
</script>
<div {...{ t: (() => { let z = 1; z++; return z / 2; })() }}></div>
