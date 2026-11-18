<script>
	let obj = { v: 1 };
	let bar = 2;

	function bump() {
		bar = 9;
	}

	$: if (obj.v) {
		// inside
		obj.w = 5;
	}

	// tail
	function after() {
		return 1;
	}
</script>

<select bind:value={obj.v}><option>{bar}</option></select>
<button onclick={bump}>{after()}</button>
