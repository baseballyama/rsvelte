<script>
	function update(fn) {
		fn({ distance: 1 });
	}

	update(($viewport) => {
		$viewport.distance = 42;
	});
</script>

<p>ok</p>
