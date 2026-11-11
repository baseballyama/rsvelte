<script>
	let obj = { v: 1 };
	let bar = 2;

	function bump() {
		obj.v = 3;
	}

	$: if (obj.v) {
		// re-emitted with the effect body
		bar = 5;
	}

	let z = 1;
</script>

<select bind:value={obj.v}><option>{bar}</option></select>
<button onclick={bump}>{z}</button>
