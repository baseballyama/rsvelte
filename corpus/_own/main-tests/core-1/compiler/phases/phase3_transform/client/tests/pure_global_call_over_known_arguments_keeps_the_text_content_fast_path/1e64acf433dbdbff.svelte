<script>
	let n = $state(1);
	const d = $derived(Math.abs(n));
	function bump() { n += 1; }
</script>
<b>{d}</b>
<button onclick={bump}>+</button>
