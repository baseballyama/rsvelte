<script>
	let { 2n: a } = $props();
	function go() { a = 1; }
</script>
<button onclick={go}>{a}</button>
