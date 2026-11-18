<script>
	const viewport = {
		update(fn) {
			fn({ distance: 1 });
		}
	};

	viewport.update(($viewport) => {
		$viewport.distance = 42;
	});
</script>

<p>ok</p>
