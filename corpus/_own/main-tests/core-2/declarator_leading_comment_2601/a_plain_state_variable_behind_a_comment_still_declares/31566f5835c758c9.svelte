<script>
	let a = 1,
		// c
		b = 2;
	function bump() { b += 1; }
</script>

<button onclick={bump}>{a}{b}</button>
