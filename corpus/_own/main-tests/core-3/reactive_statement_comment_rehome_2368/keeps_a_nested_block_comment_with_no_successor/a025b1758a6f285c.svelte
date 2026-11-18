<script>
	let bar;
	$: if (bar) {
		/* inner */
		bar = [];
	}
</script>