<script>
	let w = $state(1);
	const k = 5;
	function bump() { w += 1; }
	const v = Number.isInteger(k);
</script>
<button onclick={bump}>b</button>
<u>{v}</u>
