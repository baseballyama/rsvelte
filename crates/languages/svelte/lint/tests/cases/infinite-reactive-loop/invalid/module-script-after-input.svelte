<script>
	let a = 0;

	$: {
		window.setTimeout(() => {
			a = a + 1;
		});
	}
</script>

<script module>
	$: b = 1;
</script>
