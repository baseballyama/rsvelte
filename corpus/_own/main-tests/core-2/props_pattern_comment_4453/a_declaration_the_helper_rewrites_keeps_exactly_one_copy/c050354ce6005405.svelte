<script>
	let { a /* c */ } = $props();
	function f() { a = 2; }
</script>
<i>{a}</i><button onclick={f}>x</button>
