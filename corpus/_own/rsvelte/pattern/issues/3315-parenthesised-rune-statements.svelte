<script>
	let base = $state(1);

	($inspect(base));
	($effect(() => {
		console.log(base);
	}));

	function take() {
		return ($state.snapshot(base));
	}
</script>

<p>{base}{take()}</p>
