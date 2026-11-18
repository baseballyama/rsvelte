<script>
	let a = 0;

	$: {
		window.setTimeout(() => {
			a = a + 1;
		});
	}

	$: {
		globalThis.queueMicrotask(() => {
			a = a + 1;
		});
	}
</script>
