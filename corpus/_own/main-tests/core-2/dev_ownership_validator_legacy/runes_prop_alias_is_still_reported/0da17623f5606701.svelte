<script>
	let { item } = $props();
	function go() {
		item.name = 1;
	}
</script>
<button onclick={go}>x</button>
