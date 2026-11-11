<script>
	let w = $state(1);
	const k = 5;
	function bump() { w += 1; }
	function Number() { return 7; }
	const v = Number("5");
</script>
<button onclick={bump}>b</button>
<u>{v}</u>
