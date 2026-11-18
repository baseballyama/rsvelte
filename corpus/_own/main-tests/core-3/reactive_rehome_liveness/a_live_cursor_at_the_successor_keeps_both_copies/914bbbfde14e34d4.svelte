<script>
	let obj = { v: 1 };
	let bar = 2;

	function bump() {
		bar = 9;
	}

	$: if (obj.v) {
		// dup
		bar = 5;
	}

	let z = 1;
</script>

<select bind:value={obj.v}><option>{bar}</option></select>
<button onclick={bump}>{z}</button>
