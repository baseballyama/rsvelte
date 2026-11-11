<script>
	let obj = { v: 1 };
	let bar = 2;

	function bump() {
		obj.v = 3;
	}

	$: if (obj.v) {
		bar = 5;
	}

	// swallowed: the next effect's own thunk kills before anything flushes it
	$: bar = obj.v + 1;
</script>

<select bind:value={obj.v}><option>{bar}</option></select>
<button onclick={bump}>{bar}</button>
