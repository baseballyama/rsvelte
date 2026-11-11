<script>
	let x = 1;
	let a = 0;
	$: a = x * 2;
	$: x += 1;
</script>

<p>{a} {x}</p>
