<script>
	let obj = { v: 1 };
	let bar = 2;

	function bump() {
		obj.v = 3;
	}

	// lead
	function after() {
		return 1;
	}
</script>

<select bind:value={obj.v}></select>
<button onclick={bump}>{after()}{bar}</button>
