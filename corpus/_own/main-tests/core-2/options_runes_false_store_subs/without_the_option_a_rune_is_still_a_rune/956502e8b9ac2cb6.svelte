<script>
	let a = $state(1);
	function f() { a++; }
</script>

<button onclick={f}>{a}</button>
