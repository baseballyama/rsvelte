<script>
	function fn() {}
	const arrow = () => 1;
	let reassigned = () => 2;
	reassigned = () => 3;
</script>

<p>{fn}{arrow}{reassigned}</p>
