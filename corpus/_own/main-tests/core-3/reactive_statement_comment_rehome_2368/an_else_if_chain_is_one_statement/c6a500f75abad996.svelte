<script>
	let data;
	let out = 1;
	$: if (typeof data === "object") {
		// fa
		out = 2;
	} else if (typeof data === "string") {
		// str
		out = 3;
	}
	console.log(out);
</script>