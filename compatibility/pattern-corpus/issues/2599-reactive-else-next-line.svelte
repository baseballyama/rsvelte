<script>
	let a = 1;
	let b = 0;
	$: if (a > 0) b = 1;
	else b = 2;
</script>

<p>{a}{b}</p>
