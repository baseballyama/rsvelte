<script>
	let { 9007199254740993n: a } = $props();
	function go() { a = 1; }
</script>
<button onclick={go}>{a}</button>
