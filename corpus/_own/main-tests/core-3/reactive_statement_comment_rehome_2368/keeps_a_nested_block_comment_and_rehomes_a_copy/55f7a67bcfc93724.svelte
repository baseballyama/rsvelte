<script>
	let a = 1;
	let b;
	$: if (a) {
		/* inner */
		b = 1;
	}
	let z = 1;
	console.log(z, b);
</script>