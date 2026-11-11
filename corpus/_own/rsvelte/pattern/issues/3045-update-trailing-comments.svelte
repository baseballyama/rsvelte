<script>
	let x = $state(1);

	function move() {
		x++; /* A */
		x--; /* B */
		x++; // C
		x--; // D
		++x; /* E */
		--x; // F
	}
</script>

<button onclick={move}>{x}</button>
