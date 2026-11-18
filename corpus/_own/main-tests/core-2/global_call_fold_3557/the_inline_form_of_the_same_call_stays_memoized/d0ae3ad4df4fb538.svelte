<script>
	let w = $state(1);
	const k = 5;
	function bump() { w += 1; }
</script>
<button onclick={bump}>b</button>
<u>{Math.max(1, k)}</u>
