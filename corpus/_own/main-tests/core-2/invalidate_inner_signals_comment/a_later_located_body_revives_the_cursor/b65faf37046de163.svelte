<script>
	let obj = { v: 1 };
	let bar = 2;

	function bump() {
		obj.v = 3;
	}

	// gone
	function after() {
		// kept
		return 1;
	}
</script>

<select bind:value={obj.v}><option>{bar}</option></select>
<button onclick={bump}>{after()}</button>
