<script>
	let count = $state(0);
	$inspect(count);
	function bump() {
		count += 1;
	}
	void bump;
</script>
<p>{count}</p>
