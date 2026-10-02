<script>
	let { b = $bindable() } = $props();

	function handler() {
		b++;
	}
</script>

<button onclick={handler}>Click Me!</button>
