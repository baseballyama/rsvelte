<script>
	let bar;
	let i = 0;
	$: {
		// inner
		bar = [];
	}
	while (i < 1) {
		i += 1;
	}
	console.log(bar, i);
</script>