<script>
	let result = $state();

	function measure() {
		let items = $state([1, 2]);
		let total = $derived(items.length);
		items.push(3);
		result = total;
	}
</script>

<button onclick={measure}>{result}</button>
