<script>
	let { value = 0 } = $props();

	function update(src) {
		({ a: { value } } = src);
	}
</script>

<button onclick={() => update({ a: { value: 42 } })}>{value}</button>
