<script>
	let bar;
	$: {
		bar = {
			/* inner */
			a: 1
		};
	}
	let z = 1;
	console.log(z, bar);
</script>