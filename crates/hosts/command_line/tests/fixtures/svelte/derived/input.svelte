<script>
	let count = $state(1);
	let double = $derived(count * 2);

	function increment() {
		count += 1;
	}
</script>

<button onclick={increment}>{count} * 2 = {double}</button>
