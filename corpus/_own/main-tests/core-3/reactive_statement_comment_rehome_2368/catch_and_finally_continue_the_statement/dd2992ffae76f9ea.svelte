<script>
	let a;
	let out = 1;
	$: try {
		// t
		out = a;
	} catch (e) {
		// c
		out = 0;
	} finally {
		// f
		out += 1;
	}
	console.log(out);
</script>