<script>
	let value = $state(0)
	const min = 2
	const max = 5
	function setValue() {
		if (value < min) {
			value = min
		}
	}
</script>

<p>{value}</p>
<input type="number" bind:value />
