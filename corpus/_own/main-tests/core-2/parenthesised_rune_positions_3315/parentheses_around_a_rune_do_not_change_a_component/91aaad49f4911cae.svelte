<script>
	let base = $state(1);
	function take() { return ((($state.snapshot(base)))); }
</script>
<p>{base}</p>
